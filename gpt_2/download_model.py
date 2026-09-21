"""Download an original OpenAI GPT-2 checkpoint into the local API's model folder."""
import argparse
from pathlib import Path

import requests
from tqdm import tqdm

MODELS_DIR = Path(__file__).resolve().parent / 'data' / 'models'
MODEL_NAMES = ('124M', '355M', '774M', '1558M')
FILES = ('checkpoint', 'encoder.json', 'hparams.json', 'model.ckpt.data-00000-of-00001',
         'model.ckpt.index', 'model.ckpt.meta', 'vocab.bpe')
BASE_URL = 'https://openaipublic.blob.core.windows.net/gpt-2/models'


def download_model(model, models_dir=MODELS_DIR):
    if model not in MODEL_NAMES:
        raise ValueError(f'Choose a model size from {", ".join(MODEL_NAMES)}')
    target = Path(models_dir) / model
    target.mkdir(parents=True, exist_ok=True)
    for filename in FILES:
        destination = target / filename
        if destination.is_file() and destination.stat().st_size:
            print(f'Already present: {destination.name}')
            continue
        partial = target / (filename + '.part')
        try:
            with requests.get(f'{BASE_URL}/{model}/{filename}', stream=True, timeout=(15, 60)) as response:
                response.raise_for_status()
                expected = int(response.headers.get('content-length', 0))
                received = 0
                with partial.open('wb') as output, tqdm(
                        desc=filename, total=expected or None, unit='B', unit_scale=True) as progress:
                    for chunk in response.iter_content(chunk_size=1024 * 1024):
                        output.write(chunk)
                        received += len(chunk)
                        progress.update(len(chunk))
                if not received or (expected and received != expected):
                    raise OSError(f'Incomplete download of {filename}; run the command again.')
            partial.replace(destination)
        finally:
            partial.unlink(missing_ok=True)
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('model', choices=MODEL_NAMES, nargs='?', default='124M')
    args = parser.parse_args()
    try:
        target = download_model(args.model)
    except (OSError, requests.RequestException) as error:
        parser.exit(1, f'Download failed: {error}\n')
    print(f'Model ready: {target}')


if __name__ == '__main__':
    main()
