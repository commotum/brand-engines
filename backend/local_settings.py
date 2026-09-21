"""Local API settings, with opt-in hosts and browser origins for a private proxy."""
import os

from backend.settings import *

ALLOWED_HOSTS = ['127.0.0.1', 'localhost'] + [
    host.strip() for host in os.environ.get('MUSE_ALLOWED_HOSTS', '').split(',')
    if host.strip()
]
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in os.environ.get('MUSE_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https?://(?:localhost|127\.0\.0\.1)(?::[0-9]+)?$',
] + [
    pattern.strip()
    for pattern in os.environ.get('MUSE_ALLOWED_ORIGIN_REGEXES', '').split(',')
    if pattern.strip()
]
CORS_URLS_REGEX = r'^/api/'
CORS_ALLOW_METHODS = ['GET', 'POST', 'DELETE', 'OPTIONS']
CORS_ALLOW_PRIVATE_NETWORK = os.environ.get('MUSE_ALLOW_PRIVATE_NETWORK') == '1'
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'backend.local_middleware.LocalAPI',
] + MIDDLEWARE
