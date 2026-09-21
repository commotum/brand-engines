import json
import os
import numpy as np
from gpt_2.src.tf_compat import tf

import gpt_2.src.model as model
import gpt_2.src.sample as sample
import gpt_2.src.encoder as encoder
from gpt_2.src import MODEL_DIR
from gpt_2.src.checkpoints import resolve as resolve_checkpoint


def sample_model(
        model_name='117M',
        seed=None,
        nsamples=0,
        input=None,
        batch_size=1,
        length=None,
        temperature=1,
        top_k=0,
        top_p=0.0,
        checkpoint=None
):
    """
    Run the sample_model
    :model_name=117M : String, which model to use
    :seed=None : Integer seed for random number generators, fix seed to
     reproduce results
    :nsamples=0 : Number of samples to return, if 0, continues to
     generate samples indefinately.
    :batch_size=1 : Number of batches (only affects speed/memory).
    :input=None : Text to feed to the generator
    :length=None : Number of tokens in generated text, if None (default), is
     determined by model hyperparameters
    :temperature=1 : Float value controlling randomness in boltzmann
     distribution. Lower temperature results in less random completions. As the
     temperature approaches zero, the model will become deterministic and
     repetitive. Higher temperature results in more random completions.
    :top_k=0 : Integer value controlling diversity. 1 means only 1 word is
     considered for each step (token), resulting in deterministic completions,
     while 40 means 40 words are considered at each step. 0 (default) is a
     special setting meaning no restrictions. 40 generally is a good value.
    :top_p=0.0 : Float value controlling diversity. Implements nucleus sampling,
     overriding top_k if set to a value > 0. A good setting is 0.9.
    """
    enc = encoder.get_encoder(model_name)
    hparams = model.default_hparams()
    with open(os.path.join(MODEL_DIR, model_name, 'hparams.json')) as f:
        hparams.override_from_dict(json.load(f))

    context_tokens = enc.encode(input) if input else [enc.encoder['<|endoftext|>']]
    if length is None:
        length = hparams.n_ctx - len(context_tokens)
    if length < 1 or length + len(context_tokens) > hparams.n_ctx:
        raise ValueError("Can't get samples longer than window size: %s" % hparams.n_ctx)

    config = tf.ConfigProto()
    config.gpu_options.allow_growth = True
    with tf.Session(graph=tf.Graph(), config=config) as sess:
        context = tf.placeholder(tf.int32, [batch_size, None])
        np.random.seed(seed)
        tf.set_random_seed(seed)

        input_output = sample.sample_sequence(
            hparams=hparams, length=length,
            context=context,
            batch_size=batch_size,
            temperature=temperature, top_k=top_k, top_p=top_p
        )

        output = sample.sample_sequence(
            hparams=hparams, length=length,
            start_token=enc.encoder['<|endoftext|>'],
            batch_size=batch_size,
            temperature=temperature, top_k=top_k, top_p=top_p
        )[:, 1:]

        saver = tf.train.Saver()
        ckpt = checkpoint or resolve_checkpoint(model_name)
        saver.restore(sess, ckpt)

        generated = 0
        ret = []
        while nsamples == 0 or generated < nsamples:
            if input and input != "":
                context_tokens = enc.encode(input)
                out = sess.run(input_output, feed_dict={
                    context: [context_tokens for _ in range(batch_size)]
                })[:, len(context_tokens):]
            else:
                out = sess.run(output)
            for i in range(batch_size):
                generated += 1
                text = enc.decode(out[i])
                ret.append("=" * 40 + " SAMPLE " + str(generated) + " " + "=" * 40)
                ret.append(text)
        return ret

