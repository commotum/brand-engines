from django.http import HttpRequest
from backend import utils


def get_models(req: HttpRequest):
    return utils.json_response(utils.list_models())

def get_model(req: HttpRequest):
    if req.method != 'GET':
        return utils.error_json_response({'error': 'Only post allowed'}, 400)
    if 'id' not in req.GET:
        return utils.error_json_response({'error': 'Param id is required'}, 400)
    id = req.GET['id']

    if not utils.model_exists(id):
        return utils.error_json_response({'error': 'Model do not exists'}, 400)

    return utils.json_response(utils.get_model(id))

def fork_model(req: HttpRequest):
    if req.method != 'POST':
        return utils.error_json_response({'error': 'Only post allowed'}, 400)
    if 'id' not in req.GET:
        return utils.error_json_response({'error': 'Param id is required'}, 400)
    if 'new_id' not in req.GET:
        return utils.error_json_response({'error': 'Param new_id is required'}, 400)
    if not req.body:
        return utils.error_json_response({'error': 'Dataset not provided'}, 400)
    id = req.GET['id']
    file_name = req.GET['fileName'] if 'fileName' in req.GET else ''
    count = req.GET['count'] if 'count' in req.GET else None
    new_id = req.GET['new_id']
    dataset = req.body.decode('utf-8')

    if not utils.model_exists(id):
        return utils.error_json_response({'error': 'Model do not exists'}, 400)

    if utils.model_exists(new_id):
        return utils.error_json_response({'error': 'New model name is taken'}, 400)

    return utils.json_response({'success': utils.fork_model(id, new_id, dataset, file_name, count)})

def generate_model(req: HttpRequest):
    if req.method != 'GET':
        return utils.error_json_response({'error': 'Only get allowed'}, 400)
    if 'id' not in req.GET:
        return utils.error_json_response({'error': 'Param id is required'}, 400)
    id = req.GET['id']
    length = req.GET['length'] if 'length' in req.GET else 50
    count = req.GET['count'] if 'count' in req.GET else None
    text = req.GET['input'] if 'input' in req.GET else ""
    top_k = req.GET['top_k'] if 'top_k' in req.GET else 0
    temperature = req.GET['temperature'] if 'top_k' in req.GET else 1

    if not utils.model_exists(id):
        return utils.error_json_response({'error': 'Model do not exists'}, 400)

    return utils.json_response(utils.generate_model(id, length, temperature, top_k, text, count))

def train_model(req: HttpRequest):
    if req.method != 'POST':
        return utils.error_json_response({'error': 'Only post allowed'}, 400)
    if 'id' not in req.GET:
        return utils.error_json_response({'error': 'Param id is required'}, 400)
    if 'steps' not in req.GET:
        return utils.error_json_response({'error': 'Param steps is required'}, 400)
    if 'every' not in req.GET:
        return utils.error_json_response({'error': 'Param every is required'}, 400)
    id = req.GET['id']
    steps = req.GET['steps']
    every = req.GET['every']

    if not utils.model_exists(id):
        return utils.error_json_response({'error': 'Model do not exists'}, 400)

    return utils.json_response({'success': utils.train_model(id, every, steps)})

def read_train_model(req: HttpRequest):
    if req.method != 'GET':
        return utils.error_json_response({'error': 'Only get allowed'}, 400)
    if 'id' not in req.GET:
        return utils.error_json_response({'error': 'Param id is required'}, 400)
    id = req.GET['id']
    amount = req.GET['amount'] if 'amount' in req.GET else 300

    if not utils.model_exists(id):
        return utils.error_json_response({'error': 'Model do not exists'}, 400)

    return utils.json_response(utils.read_train_model(id, amount))

def get_model_samples(req: HttpRequest):
    if req.method != 'GET':
        return utils.error_json_response({'error': 'Only get allowed'}, 400)
    if 'id' not in req.GET:
        return utils.error_json_response({'error': 'Param id is required'}, 400)
    id = req.GET['id']
    amount = req.GET['amount'] if 'amount' in req.GET else None

    if not utils.model_exists(id):
        return utils.error_json_response({'error': 'Model do not exists'}, 400)

    return utils.json_response(utils.get_model_samples(id, amount))
