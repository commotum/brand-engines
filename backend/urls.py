from django.urls import path
from . import api

urlpatterns = [
    path('api/get-models', api.get_models),
]
