from os.path import join, exists
from os import listdir, rename
import json
import re
from typing import Dict

from django.http import JsonResponse

from shutil import rmtree, copyfile, disk_usage
from pathlib import Path
import math

from backend import GPT_2_PATH, MODELS_DIR, CHECKPOINT_DIR
from backend.metadata import update_metadata, update_metadata_steps, handle_metadata, MODEL_METADATA_FILE, \
    rename_metadata, update_steps
from gpt_2.src.encode import encode, Args as EncodeArgs
from gpt_2.src.checkpoints import resolve as resolve_checkpoint
from backend.local_runtime import exclusive, run_worker

MODEL_OUTPUT = 'output.log'
MODEL_DATASET = 'dataset.npz'


def json_response(data):
    return JsonResponse(data, safe=False)


def error_json_response(data, status=500):
    return JsonResponse(data, safe=False, status=status)


def list_dir(path: str):
    return listdir(path)


def file_exists(path: str):
    return exists(path)


def rename_file(path: str, new_path: str):
    return rename(path, new_path)


def get_file_json(path: str):
    with open(path) as metadata_raw:
        metadata = json.load(metadata_raw)
        return metadata


def delete_dir(path: str):
    if exists(path):
        rmtree(path)


def list_models():
    if not exists(MODELS_DIR):
        return []
    dir_list = list_dir(MODELS_DIR)
    ret = []
    for dir in dir_list:
        if dir.startswith('.') or not Path(MODELS_DIR, dir).is_dir():
            continue
        ret.append({'name': dir, **get_metadata(dir)})
    return ret


def get_model(id: str):
    return {'name': id, **get_metadata(id)}


def model_exists(id: str) -> bool:
    return file_exists(join(MODELS_DIR, id))


def get_metadata(id: str):
    metadata_path = join(MODELS_DIR, id, MODEL_METADATA_FILE)
    if not file_exists(metadata_path):
        return {'core': True, 'history': []}
    return get_file_json(metadata_path)


@exclusive
def rename_model(id: str, new_id: str) -> bool:
    path = join(GPT_2_PATH, 'models')
    checkpoint_path = join(GPT_2_PATH, 'checkpoint')
    samples_path = join(GPT_2_PATH, 'samples')
    dir_path = join(path, id)
    new_dir_path = join(path, new_id)
    rename_file(dir_path, new_dir_path)
    if exists(checkpoint_path):
        checkpoint = join(checkpoint_path, id)
        new_checkpoint = join(checkpoint_path, new_id)
        if file_exists(checkpoint):
            rename_file(checkpoint, new_checkpoint)

    if exists(samples_path):
        sample = join(samples_path, id)
        new_sample = join(samples_path, new_id)
        if file_exists(sample):
            rename_file(sample, new_sample)
    rename_metadata(new_id, new_id)

    return True


@exclusive
def delete_model(id: str) -> bool:
    model_path = join(GPT_2_PATH, 'models')
    checkpoint_path = join(GPT_2_PATH, 'checkpoint')
    samples_path = join(GPT_2_PATH, 'samples')
    delete_dir(join(model_path, id))
    delete_dir(join(checkpoint_path, id))
    delete_dir(join(samples_path, id))
    return True


@exclusive
def train_model(id: str, every: str, steps: str) -> bool:
    every, steps = int(every), int(steps)
    if every < 1 or steps < 1:
        raise ValueError('Steps and sampling interval must be positive integers')
    dataset = join(MODELS_DIR, id, MODEL_DATASET)
    if not exists(dataset):
        raise ValueError('Fork this model with a training dataset first')
    prefix = Path(resolve_checkpoint(id))
    checkpoint_bytes = sum(p.stat().st_size for p in prefix.parent.glob(prefix.name + '.*'))
    saves = (steps + every - 1) // every
    required = saves * checkpoint_bytes + 1024**3
    if disk_usage(MODELS_DIR).free < required:
        raise ValueError(f'This run needs about {required / 1024**3:.1f} GiB for {saves} new checkpoints. '
                         'Free disk space or save less frequently.')
    update_metadata(id, {"training": True})
    try:
        run_worker('train', {'dataset': dataset, 'sample_every': every, 'save_every': every,
                            'steps_num': steps, 'model_name': id, 'run_name': id,
                            'output_file': MODEL_OUTPUT})
    except Exception as error:
        with open(join(MODELS_DIR, id, MODEL_OUTPUT), 'a') as log:
            log.write(f'\nTraining failed: {error}\n')
        raise
    finally:
        update_metadata(id, {"training": False})
        update_metadata_steps(id)
    return True


def encode_dataset(id: str, dataset: str) -> bool:
    txt_dataset = f"{MODEL_DATASET}.txt"
    with open(join(GPT_2_PATH, 'models', id, txt_dataset), "w") as dataset_file:
        dataset_file.write(dataset)
    encode(EncodeArgs({'model_name': id, 'in_text': join(GPT_2_PATH, 'models', id, txt_dataset),
                       'out_nzp': join(GPT_2_PATH, 'models', id, MODEL_DATASET)}))

    return True


def read_train_model(id: str, amount: int = 100) -> bool:
    ret = []
    if not exists(join(MODELS_DIR, id, MODEL_OUTPUT)):
        return []
    amount = int(amount)
    if amount < 1:
        raise ValueError('Log line count must be positive')
    with open(join(GPT_2_PATH, 'models', id, MODEL_OUTPUT), "r") as out:
        for line in (out.readlines()[-amount:]):
            ret.append(line.replace("\n", ""))
    return ret


def is_core_model(id: str) -> bool:
    return get_metadata(id).get('core')


@exclusive
def fork_model(id: str, new_id: str, dataset: str = None, file_name: str = None, amount: int = None) -> bool:
    source = Path(MODELS_DIR) / id
    target = Path(MODELS_DIR) / new_id
    prefix = Path(resolve_checkpoint(id, amount))
    files = [p for p in source.iterdir() if p.is_file() and
             not p.name.startswith(('model', 'events', 'metadata-')) and
             p.name not in ('checkpoint', 'counter', MODEL_OUTPUT)]
    weights = list(prefix.parent.glob(prefix.name + '.*'))
    if disk_usage(MODELS_DIR).free < sum(p.stat().st_size for p in files + weights) + 1024**3:
        raise ValueError('Not enough free disk space to fork these weights')
    target.mkdir()
    try:
        for file in files + weights:
            copyfile(file, target / file.name)
        (target / 'checkpoint').write_text(f'model_checkpoint_path: "{prefix.name}"\n')
        counter = int(prefix.name.split('-')[1]) if prefix.parent != source and prefix.name.startswith('model-') else 0
        if counter:
            update_steps(new_id, id, counter)
        handle_metadata(new_id, id, file_name)
        if dataset:
            encode_dataset(new_id, dataset)
    except Exception:
        rmtree(target)
        raise
    return True


@exclusive
def generate_model(id: str, length: int, temp: float = 1.0, top_k: float = 0, input: str = None,
                   amount: int = None) -> str:
    length, top_k, temp = int(length), int(top_k), float(temp)
    if length < 1 or length > 1023 or top_k < 0 or top_k > 50257 or not math.isfinite(temp) or temp <= 0:
        raise ValueError('Use length 1–1023, top-k 0–50257 and a positive temperature')
    checkpoint = resolve_checkpoint(id, amount)
    samples = run_worker('generate', dict(nsamples=1, input=input, model_name=id, length=length,
                                          temperature=temp, top_k=top_k, checkpoint=checkpoint))
    return "".join(line for line in samples if not re.search("^.*=+.*=+.*$", line))


def get_model_samples(id: str, count: int = None) -> Dict:
    path = join(GPT_2_PATH, 'samples')
    if not exists(path):
        return {}
    samples_path = join(path, id)
    checkpoint_path = join(CHECKPOINT_DIR, id, )
    if not exists(samples_path):
        return {}

    ret = {}
    files = list_dir(samples_path)
    for file in files:
        *rest, number_str = file.split('-')
        if not count or int(number_str) <= int(count):
            ret[number_str] = {'data': [], 'loss': -1, 'avg_loss': -1}
            with open(join(samples_path, file), "r") as out:
                for line in out.readlines():
                    if re.search("^.*=+.*=+.*$", line):
                        ret[number_str]['data'].append("")
                    else:
                        if len(ret[number_str]['data']) == 0:
                            ret[number_str]['data'].append("")
                        ret[number_str]['data'][-1] += line
            if exists(checkpoint_path) and exists(join(checkpoint_path, f"metadata-{number_str}.json")):
                with open(join(checkpoint_path, f"metadata-{number_str}.json"), 'r') as metadata:
                    data = json.load(metadata)
                    ret[number_str]['loss'] = data.get('loss', -1)
                    ret[number_str]['avg_loss'] = data.get('avg_loss', -1)

    return ret
