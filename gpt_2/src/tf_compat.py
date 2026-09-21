"""Keep the original TF1 graph/checkpoint format on the local TF2 runtime."""
import tensorflow.compat.v1 as tf

tf.disable_v2_behavior()
# Resource variables allow recompute_grad; Saver still uses the original names.
tf.enable_resource_variables()


def recompute_grad(function):
    """Recompute a transformer block only when its upstream gradient is ready.

    TF 2.15's recompute_grad uses tensor ``==`` for its scheduling dependency.
    In this TF1 graph runtime that becomes Python True, so recomputation can run
    during the forward pass and retain every block's intermediate activations.
    An explicit control dependency preserves the intended backward-pass order.
    """
    scope = tf.get_variable_scope()

    @tf.custom_gradient
    def wrapped(x):
        output = function(x)

        def gradient(dy, variables=None):
            variables = list(variables or [])
            with tf.control_dependencies([dy]):
                block_input = tf.stop_gradient(tf.identity(x))
            with tf.variable_scope(scope, reuse=True):
                recomputed = function(block_input)
            gradients = tf.gradients(
                recomputed, [block_input] + variables, grad_ys=dy)
            return gradients[0], gradients[1:]

        return output, gradient

    return wrapped


class HParams:
    """The small subset of the removed contrib HParams used by GPT-2."""
    def __init__(self, **values):
        self.__dict__.update(values)

    def override_from_dict(self, values):
        for name, value in values.items():
            if name not in self.__dict__:
                raise ValueError(f"Unknown model parameter: {name}")
            setattr(self, name, value)
        return self
