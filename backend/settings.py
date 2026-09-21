"""Shared settings for the file-backed API; Next.js serves the interface."""

# This local application has no login, sessions, or signed user data.
SECRET_KEY = 'muse-local-development-only'
DEBUG = False
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
INSTALLED_APPS = ['corsheaders']
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'
DATA_UPLOAD_MAX_MEMORY_SIZE = 1000000000
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
