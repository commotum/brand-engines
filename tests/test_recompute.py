"""Recomputation must preserve gradients and wait for the backward pass."""
import unittest
import numpy as np
from gpt_2.src.tf_compat import tf
from gpt_2.src import model


class RecomputeTest(unittest.TestCase):
    def test_matches_original_blocks(self):
        with tf.Session(graph=tf.Graph(), config=tf.ConfigProto(device_count={'GPU': 0})) as session:
            tf.set_random_seed(123)
            params = model.default_hparams().override_from_dict(dict(
                n_vocab=16, n_ctx=8, n_embd=8, n_head=2, n_layer=2))
            tokens = tf.constant([[1, 2, 3, 4]])
            original = model.model(params, tokens)['logits']
            recomputed = model.model(params, tokens, recompute=True)['logits']
            variables = tf.trainable_variables()
            original_grads = tf.gradients(tf.reduce_sum(original ** 2), variables)
            recomputed_grads = tf.gradients(tf.reduce_sum(recomputed ** 2), variables)
            self.assertTrue(all(g is not None for g in recomputed_grads))
            session.run(tf.global_variables_initializer())
            a, b, ga, gb = session.run([
                original, recomputed,
                [tf.convert_to_tensor(g) for g in original_grads],
                [tf.convert_to_tensor(g) for g in recomputed_grads]])
            np.testing.assert_allclose(a, b, rtol=1e-5, atol=1e-6)
            for left, right in zip(ga, gb):
                np.testing.assert_allclose(left, right, rtol=1e-5, atol=1e-6)

    def test_recomputation_waits_after_graph_optimization(self):
        config = tf.ConfigProto(device_count={'GPU': 0})
        config.graph_options.rewrite_options.layout_optimizer = 2  # OFF, as in training.
        with tf.Session(graph=tf.Graph(), config=config) as session:
            params = model.default_hparams().override_from_dict(dict(
                n_vocab=16, n_ctx=8, n_embd=8, n_head=2, n_layer=2))
            tokens = tf.placeholder(tf.int32, [1, None])
            logits = model.model(params, tokens, recompute=True)['logits']
            loss = tf.reduce_mean(tf.nn.sparse_softmax_cross_entropy_with_logits(
                labels=tokens[:, 1:], logits=logits[:, :-1]))
            update = tf.train.AdamOptimizer(2e-5).minimize(loss)
            session.run(tf.global_variables_initializer())
            metadata = tf.RunMetadata()
            session.run(update, {tokens: [[1, 2, 3, 4]]},
                        options=tf.RunOptions(output_partition_graphs=True),
                        run_metadata=metadata)

            nodes = {node.name: node for graph in metadata.partition_graphs
                     for node in graph.node}
            recomputed_attention = [name for name in nodes
                                    if name.startswith('gradients/')
                                    and name.endswith('/h0/attn/MatMul')]
            self.assertEqual(len(recomputed_attention), 1)
            pending = recomputed_attention.copy()
            ancestors = set()
            while pending:
                name = pending.pop()
                if name in ancestors:
                    continue
                ancestors.add(name)
                pending.extend(value.lstrip('^').split(':')[0]
                               for value in nodes[name].input)

            # Without a backward-pass gate, block 0 can recompute while the
            # forward pass is still running, retaining its large activations.
            self.assertIn('model/h1/add_1', ancestors)
            self.assertTrue(any(name.startswith('gradients/') and '/h1/' in name
                                for name in ancestors))


if __name__ == '__main__':
    unittest.main()
