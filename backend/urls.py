from django.urls import path
from . import api

urlpatterns = [
    path('api/get-models', api.get_models),
    path('api/rename-model', api.rename_model),
    path('api/fork-model', api.fork_model),
    path('api/delete-model', api.delete_model),
    path('api/train-model', api.train_model),
    path('api/get-model', api.get_model),
    path('api/generate-model', api.generate_model),
    path('api/read-train-model', api.read_train_model),
    path('api/get-model-steps', api.get_model_samples),
]
