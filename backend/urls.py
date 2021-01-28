from django.urls import path
from . import api

urlpatterns = [
    path('api/get-models', api.get_models),
    path('api/get-model', api.get_model),
]
