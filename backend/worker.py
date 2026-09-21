"""A fresh TensorFlow process for each original training/sampling call."""
import json
from pathlib import Path
import sys


def main():
    from gpt_2.src.tf_compat import tf
    gpus = tf.config.list_physical_devices('GPU')
    if not gpus:
        raise RuntimeError('No NVIDIA GPU detected by TensorFlow; refusing silent CPU fallback.')
    print('TensorFlow GPU:', gpus, flush=True)
    args = json.load(sys.stdin)
    if sys.argv[1] == 'train':
        from gpt_2.src.train import train, Args
        train(Args(args))
        result = True
    elif sys.argv[1] == 'generate':
        from gpt_2.src.generate_samples import sample_model
        result = sample_model(**args)
    else:
        raise ValueError('Unknown GPU operation')
    Path(sys.argv[2]).write_text(json.dumps(result))


if __name__ == '__main__':
    main()
