from django.http import HttpRequest
from backend import utils


def get_models(req: HttpRequest):
    return utils.json_response(utils.list_models())
