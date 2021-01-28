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
