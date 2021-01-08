from os.path import join, dirname

GPT_2_PATH = join(dirname(__file__), '..', 'gpt_2', 'data')
MODELS_DIR = join(GPT_2_PATH, 'models')
SAMPLES_DIR = join(GPT_2_PATH, 'samples')
CHECKPOINT_DIR = join(GPT_2_PATH, 'checkpoint')
DATA_PATH = join(dirname(__file__), 'tests', 'data')
