from typing import Dict

import json
from os.path import join, exists
from math import floor
from time import time

from backend import MODELS_DIR, GPT_2_PATH

MODEL_METADATA_FILE = '_metadata.json'
COUNTER = 'counter'


def get_history_item(id: str, file: str = None) -> Dict:
    return {'id': id, 'created': floor(time()), 'updated': floor(time()), "file": file}


def get_new_metadata(id: str, prev_id: str, file: str) -> Dict:
    return {"core": False, "training": False, "generating": False,
            "history": [get_history_item(id, file), get_history_item(prev_id)]}


def get_metadata(id: str) -> Dict:
    metadata_path = join(MODELS_DIR, id, MODEL_METADATA_FILE)
    is_new = not exists(metadata_path)
    if is_new:
        return {}
    with open(metadata_path, "r") as metadata_file:
        return json.load(metadata_file)


def rename_metadata(id: str, new_id: str) -> Dict:
    metadata = get_metadata(id)
    history = metadata.get('history', [])
    if len(history) <= 0:
        return None

    current_history_item = history[0]
    current_history_item['id'] = new_id
    metadata['history'] = [current_history_item, *history[1:]]
    return update_metadata(id, metadata)


def update_steps(id: str, id_to_update: str, count: int) -> Dict:
    metadata = get_metadata(id)
    history = metadata.get('history', [])
    if len(history) <= 0:
        return None

    for item in history:
        if item.get('id') == id_to_update:
            item['steps'] = count

    metadata['history'] = history
    return update_metadata(id, metadata)


def update_metadata(id: str, data) -> Dict:
    metadata_path = join(MODELS_DIR, id, MODEL_METADATA_FILE)
    import os
    import tempfile
    metadata = get_metadata(id)
    new_data = {**metadata, **data}
    with tempfile.NamedTemporaryFile(mode='w', dir=MODELS_DIR, delete=False) as file:
        json.dump(new_data, file)
        temporary = file.name
    os.replace(temporary, metadata_path)
    return new_data


def handle_metadata(id: str, prev_id: str, file_name: str):
    metadata_path = join(MODELS_DIR, id, MODEL_METADATA_FILE)
    is_new = not exists(metadata_path)
    if is_new:
        metadata = get_new_metadata(id, prev_id, file_name)
    else:
        metadata = get_metadata(id)
        metadata['core'] = False
        metadata['training'] = False
        metadata['generating'] = False
        history = metadata.get('history', [])
        if len(history) == 0:
            history.insert(0, get_history_item(prev_id))
        history.insert(0, get_history_item(id, file_name))
        metadata['history'] = history
    update_metadata(id, metadata)
    return metadata


def get_counter(id: str):
    path = join(GPT_2_PATH, 'checkpoint')
    counter_path = join(path, id, COUNTER)
    if not exists(path) or not exists(counter_path):
        return 0
    with open(counter_path) as counter_file:
        counter = counter_file.readline()
        return int(counter)


def update_metadata_steps(id: str):
    metadata = get_metadata(id)
    history = metadata.get('history', [])
    if len(history) <= 0:
        return None

    current_history_item = history[0]
    current_history_item['steps'] = get_counter(id)
    current_history_item['updated'] = floor(time())
    metadata['history'] = [current_history_item, *history[1:]]
    return update_metadata(id, metadata)
