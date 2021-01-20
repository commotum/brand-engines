from os.path import join, exists
from os import listdir
import json
from django.http import JsonResponse
from backend import MODELS_DIR
from backend.metadata import MODEL_METADATA_FILE


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

def get_file_json(path: str):
    with open(path) as metadata_raw:
        metadata = json.load(metadata_raw)
        return metadata

def list_models():
    dir_list = list_dir(MODELS_DIR)
    ret = []
    for dir in dir_list:
        ret.append({'name': dir, **get_metadata(dir)})
    return ret

def get_metadata(id: str):
    metadata_path = join(MODELS_DIR, id, MODEL_METADATA_FILE)
    if not file_exists(metadata_path):
        return {'core': True}
    return get_file_json(metadata_path)

def is_core_model(id: str) -> bool:
    return get_metadata(id).get('core')
