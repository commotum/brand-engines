import numpy as np

import gpt_2.src.encoder as encoder
from gpt_2.src.load_dataset import load_dataset

class Args():
    def __init__(self, data):
        self.model_name = data.get('model_name', '117M')
        self.combine = data.get('combine', 5000)
        self.encoding = data.get('encoding', 'utf-8')
        self.in_text = data.get('in_text')
        self.out_npz = data.get('out_nzp')

def encode(args):
    enc = encoder.get_encoder(args.model_name)
    print('Reading files')
    chunks = load_dataset(enc, args.in_text, args.combine, encoding=args.encoding)
    print('Writing', args.out_npz)
    np.savez_compressed(args.out_npz, *chunks)

