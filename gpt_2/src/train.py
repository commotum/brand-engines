import json
import os
import numpy as np
import tensorflow as tf
import time
import tqdm
from tensorflow.core.protobuf import rewriter_config_pb2
import gpt_2.src.model as model
import gpt_2.src.sample as sample
import gpt_2.src.encoder as encoder
import gpt_2.src.memory_saving_gradients as memory_saving_gradients
from gpt_2.src import CHECKPOINT_DIR, MODEL_DIR, SAMPLE_DIR
from gpt_2.src.accumulate import AccumulatingOptimizer
from gpt_2.src.load_dataset import load_dataset, Sampler


class Logger():
    def __init__(self, path):
        self.path = path
        with open(self.path, 'w') as file:
            file.write('')

    def out(self, text):
        with open(self.path, 'a') as file:
            file.write(f"{text}\n")


class Args():
    def __init__(self, data):
        self.output_file = data.get('output_file', 'output.log')
        self.dataset = data.get(
            'dataset')  # Input file, directory, or glob pattern (utf-8 text, or preencoded .npz files).
        self.model_name = data.get('model_name', '117M')  # Pretrained model name
        self.combine = data.get('combine',
                                50000)  # Concatenate input files with <|endoftext|> separator into chunks of this minimum size
        self.encoding = data.get('encoding', 'utf-8')  # Set the encoding for reading and writing files.
        self.batch_size = data.get('batch_size', 1)  # Batch size
        self.learning_rate = data.get('learning_rate', 0.00002)  # Learning rate for Adam
        self.accumulate_gradients = data.get('accumulate_gradients', 1)  # Accumulate gradients across N minibatches.
        self.memory_saving_gradients = data.get('memory_saving_gradients',
                                                'store_true')  # Use gradient checkpointing to reduce vram usage.
        self.only_train_transformer_layers = data.get('only_train_transformer_layers',
                                                      False)  # Restrict training to the transformer blocks.
        self.optimizer = data.get('optimizer', 'adam')  # Optimizer. <adam|sgd>.
        self.noise = data.get('noise', 0.0)  # Add noise to input training data to regularize against typos.
        self.top_k = data.get('top_k', 40)  # K for top-k sampling.
        self.top_p = data.get('top_p', 0.0)  # P for top-p sampling. Overrides top_k if set > 0.
        self.restore_from = data.get('restore_from',
                                     "latest")  # Either "latest", "fresh", or a path to a checkpoint file
        self.run_name = data.get('run_name', 'run1')  # Run id. Name of subdirectory in checkpoint/ and samples
        self.sample_every = data.get('sample_every', 100)  # Generate samples every N steps
        self.sample_length = data.get('sample_length', 1023)  # Sample this many tokens
        self.sample_num = data.get('sample_num', 3)  # Generate this many samples
        self.save_every = data.get('save_every', 1000)  # Write a checkpoint every N steps
        self.steps_num = data.get('steps_num', 100)  # Run N steps
        self.val_dataset = data.get('val_dataset', None)  # Dataset for validation loss, defaults to --dataset.'
        self.val_batch_size = data.get('val_batch_size', 2)  # Batch size for validation.
        self.val_batch_count = data.get('val_batch_count', 40)  # Number of batches for validation.
        self.val_every = data.get('val_every', 0)  # Calculate validation loss every STEPS steps.


def maketree(path):
    try:
        os.makedirs(path)
    except:
        pass


def randomize(context, hparams, p):
    if p > 0:
        mask = tf.random.uniform(shape=tf.shape(context)) < p
        noise = tf.random.uniform(shape=tf.shape(context), minval=0, maxval=hparams.n_vocab, dtype=tf.int32)
        return tf.where(mask, noise, context)
    else:
        return context


def train(args):
    logger = Logger(os.path.join(MODEL_DIR, args.model_name, args.output_file))
    enc = encoder.get_encoder(args.model_name)
    hparams = model.default_hparams()
    with open(os.path.join(MODEL_DIR, args.model_name, 'hparams.json')) as f:
        hparams.override_from_dict(json.load(f))

    if args.sample_length > hparams.n_ctx:
        raise ValueError(
            "Can't get samples longer than window size: %s" % hparams.n_ctx)

    if args.model_name == '345M':
        args.memory_saving_gradients = True
        if args.optimizer == 'adam':
            args.only_train_transformer_layers = True

    config = tf.ConfigProto()
    config.gpu_options.allow_growth = True
    config.graph_options.rewrite_options.layout_optimizer = rewriter_config_pb2.RewriterConfig.OFF
    with tf.Session(config=config) as sess:
        context = tf.placeholder(tf.int32, [args.batch_size, None])
        context_in = randomize(context, hparams, args.noise)
        output = model.model(hparams=hparams, X=context_in)
        loss = tf.reduce_mean(
            tf.nn.sparse_softmax_cross_entropy_with_logits(
                labels=context[:, 1:], logits=output['logits'][:, :-1]))

        if args.val_every > 0:
            val_context = tf.placeholder(tf.int32, [args.val_batch_size, None])
            val_output = model.model(hparams=hparams, X=val_context)
            val_loss = tf.reduce_mean(
                tf.nn.sparse_softmax_cross_entropy_with_logits(
                    labels=val_context[:, 1:], logits=val_output['logits'][:, :-1]))
            val_loss_summary = tf.summary.scalar('val_loss', val_loss)

        tf_sample = sample.sample_sequence(
            hparams=hparams,
            length=args.sample_length,
            context=context,
            batch_size=args.batch_size,
            temperature=1.0,
            top_k=args.top_k,
            top_p=args.top_p)

        all_vars = [v for v in tf.trainable_variables() if 'model' in v.name]
        train_vars = [v for v in all_vars if '/h' in v.name] if args.only_train_transformer_layers else all_vars

        if args.optimizer == 'adam':
            opt = tf.train.AdamOptimizer(learning_rate=args.learning_rate)
        elif args.optimizer == 'sgd':
            opt = tf.train.GradientDescentOptimizer(learning_rate=args.learning_rate)
        else:
            exit('Bad optimizer:', args.optimizer)

        if args.accumulate_gradients > 1:
            if args.memory_saving_gradients:
                exit("Memory saving gradients are not implemented for gradient accumulation yet.")
            opt = AccumulatingOptimizer(
                opt=opt,
                var_list=train_vars)
            opt_reset = opt.reset()
            opt_compute = opt.compute_gradients(loss)
            opt_apply = opt.apply_gradients()
            summary_loss = tf.summary.scalar('loss', opt_apply)
        else:
            if args.memory_saving_gradients:
                opt_grads = memory_saving_gradients.gradients(loss, train_vars)
            else:
                opt_grads = tf.gradients(loss, train_vars)
            opt_grads = list(zip(opt_grads, train_vars))
            opt_apply = opt.apply_gradients(opt_grads)
            summary_loss = tf.summary.scalar('loss', loss)

        summary_lr = tf.summary.scalar('learning_rate', args.learning_rate)
        summaries = tf.summary.merge([summary_lr, summary_loss])

        summary_log = tf.summary.FileWriter(
            os.path.join(CHECKPOINT_DIR, args.run_name))

        saver = tf.train.Saver(
            var_list=all_vars,
            max_to_keep=5,
            keep_checkpoint_every_n_hours=2)
        sess.run(tf.global_variables_initializer())

        if args.restore_from == 'latest':
            ckpt = tf.train.latest_checkpoint(
                os.path.join(CHECKPOINT_DIR, args.run_name))
            if ckpt is None:
                # Get fresh GPT weights if new run.
                ckpt = tf.train.latest_checkpoint(
                    os.path.join(MODEL_DIR, args.model_name))
        elif args.restore_from == 'fresh':
            ckpt = tf.train.latest_checkpoint(
                os.path.join('../models', args.model_name))
        else:
            ckpt = tf.train.latest_checkpoint(args.restore_from)
        logger.out(f"Loading checkpoint {ckpt}")
        saver.restore(sess, ckpt)

        logger.out("Loading dataset")
        chunks = load_dataset(enc, args.dataset, args.combine, encoding=args.encoding)
        data_sampler = Sampler(chunks)
        if args.val_every > 0:
            if args.val_dataset:
                val_chunks = load_dataset(enc, args.val_dataset, args.combine, encoding=args.encoding)
            else:
                val_chunks = chunks
        logger.out(f"Dataset has {data_sampler.total_size} tokens")
        logger.out("Training")

        if args.val_every > 0:
            # Sample from validation set once with fixed seed to make
            # it deterministic during training as well as across runs.
            val_data_sampler = Sampler(val_chunks, seed=1)
            val_batches = [[val_data_sampler.sample(1024) for _ in range(args.val_batch_size)]
                           for _ in range(args.val_batch_count)]

        run_counter = 1
        counter = 1
        counter_path = os.path.join(CHECKPOINT_DIR, args.run_name, 'counter')
        if os.path.exists(counter_path):
            # Load the step number if we're resuming a run
            # Add 1 so we don't immediately try to save again
            with open(counter_path, 'r') as fp:
                counter = int(fp.read()) + 1

        def save():
            maketree(os.path.join(CHECKPOINT_DIR, args.run_name))
            logger.out(f"Saving model-{counter}")
            saver.save(
                sess,
                os.path.join(CHECKPOINT_DIR, args.run_name, 'model'),
                global_step=counter)
            with open(os.path.join(CHECKPOINT_DIR, args.run_name, f"metadata-{counter}.json"), 'w') as metafile:
                json.dump({'loss': "{:2.2f}".format(v_loss), 'avg_loss': "{:2.2f}".format(avg_loss[0] / avg_loss[1])},
                          metafile)
            with open(counter_path, 'w') as fp:
                fp.write(str(counter) + '\n')

        def generate_samples():
            logger.out('Generating samples...')
            context_tokens = data_sampler.sample(1)
            all_text = []
            index = 0
            while index < args.sample_num:
                out = sess.run(
                    tf_sample,
                    feed_dict={context: args.batch_size * [context_tokens]})
                for i in range(min(args.sample_num - index, args.batch_size)):
                    text = enc.decode(out[i])
                    text = '======== SAMPLE {} ========\n{}\n'.format(
                        index + 1, text)
                    all_text.append(text)
                    logger.out(text)
                    index += 1
            maketree(os.path.join(SAMPLE_DIR, args.run_name))
            with open(
                    os.path.join(SAMPLE_DIR, args.run_name,
                                 'samples-{}').format(counter), 'w', encoding=args.encoding) as fp:
                fp.write('\n'.join(all_text))

        def validation():
            logger.out('Calculating validation loss...')
            losses = []
            for batch in tqdm.tqdm(val_batches):
                losses.append(sess.run(val_loss, feed_dict={val_context: batch}))
            v_val_loss = np.mean(losses)
            v_summary = sess.run(val_loss_summary, feed_dict={val_loss: v_val_loss})
            summary_log.add_summary(v_summary, counter)
            summary_log.flush()
            logger.out(f"'[{counter} | {(time.time() - start_time):2.2f}] validation loss = {(v_val_loss):2.2f}")

        def sample_batch():
            return [data_sampler.sample(1024) for _ in range(args.batch_size)]

        avg_loss = (0.0, 0.0)
        start_time = time.time()

        try:
            while True:
                if run_counter >= args.steps_num:
                    generate_samples()
                    save()
                    break
                if run_counter % args.save_every == 0:
                    save()
                if run_counter % args.sample_every == 0:
                    generate_samples()
                if args.val_every > 0 and (counter % args.val_every == 0 or counter == 1):
                    validation()

                if args.accumulate_gradients > 1:
                    sess.run(opt_reset)
                    for _ in range(args.accumulate_gradients):
                        sess.run(
                            opt_compute, feed_dict={context: sample_batch()})
                    (v_loss, v_summary) = sess.run((opt_apply, summaries))
                else:
                    (_, v_loss, v_summary) = sess.run(
                        (opt_apply, loss, summaries),
                        feed_dict={context: sample_batch()})

                summary_log.add_summary(v_summary, counter)

                avg_loss = (avg_loss[0] * 0.99 + v_loss,
                            avg_loss[1] * 0.99 + 1.0)

                logger.out(
                    f"[{counter}, {run_counter}/{args.steps_num} | {(time.time() - start_time):2.2f}] loss={v_loss:2.2f} avg={(avg_loss[0] / avg_loss[1]):2.2f}")

                counter += 1
                run_counter += 1
        except KeyboardInterrupt:
            print('interrupted')
            save()
