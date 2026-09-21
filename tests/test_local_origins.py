"""Browser access to the loopback API through an explicitly configured proxy."""
import os
from pathlib import Path
import runpy
from unittest.mock import patch

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.local_settings')

import django
from django.http import JsonResponse
from django.test import SimpleTestCase, override_settings
from django.urls import path

from backend import local_settings

django.setup()


def probe(request):
    if request.GET.get('busy'):
        raise BlockingIOError('A model operation is already running')
    return JsonResponse({'method': request.method})


urlpatterns = [path('api/probe', probe), path('outside', probe)]
ORIGIN = 'https://muse-example.vercel.app'
HOST = 'workstation.example-tailnet.ts.net'


@override_settings(
    ROOT_URLCONF=__name__,
    MIDDLEWARE=local_settings.MIDDLEWARE,
    ALLOWED_HOSTS=['127.0.0.1', 'localhost', HOST],
    CORS_ALLOWED_ORIGINS=[ORIGIN],
    CORS_ALLOWED_ORIGIN_REGEXES=local_settings.CORS_ALLOWED_ORIGIN_REGEXES,
    CORS_URLS_REGEX=local_settings.CORS_URLS_REGEX,
    CORS_ALLOW_METHODS=local_settings.CORS_ALLOW_METHODS,
    CORS_ALLOW_PRIVATE_NETWORK=False,
    DEBUG=False,
)
class LocalOriginsTest(SimpleTestCase):
    def test_configured_origin_can_read_and_submit_to_configured_host(self):
        for method in ('GET', 'POST', 'DELETE'):
            with self.subTest(method=method):
                response = self.client.generic(method, '/api/probe', HTTP_HOST=HOST,
                                               HTTP_ORIGIN=ORIGIN)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), {'method': method})
                self.assertEqual(response['Access-Control-Allow-Origin'], ORIGIN)
                self.assertEqual(response['Cache-Control'], 'no-store')
                self.assertNotIn('Access-Control-Allow-Credentials', response)

    def test_loopback_proxy_and_local_browser_origins_still_work(self):
        for origin in (None, 'http://localhost:3000', 'http://127.0.0.1:3017'):
            with self.subTest(origin=origin):
                headers = {'HTTP_HOST': '127.0.0.1:8017'}
                if origin:
                    headers['HTTP_ORIGIN'] = origin
                response = self.client.get('/api/probe', **headers)
                self.assertEqual(response.status_code, 200)
                if origin:
                    self.assertEqual(response['Access-Control-Allow-Origin'], origin)

    def test_other_origins_are_rejected_before_the_api_runs(self):
        for origin in ('https://other.vercel.app', ORIGIN + '.evil.example',
                       'http://muse-example.vercel.app', ORIGIN + ':444',
                       'https://localhost.evil.example', 'null'):
            with self.subTest(origin=origin):
                response = self.client.post('/api/probe', HTTP_HOST=HOST,
                                            HTTP_ORIGIN=origin)
                self.assertEqual(response.status_code, 403)
                self.assertNotIn('Access-Control-Allow-Origin', response)

    def test_other_hosts_remain_rejected(self):
        response = self.client.get('/api/probe', HTTP_HOST='other.example',
                                   HTTP_ORIGIN=ORIGIN)
        self.assertEqual(response.status_code, 400)

    def test_delete_preflight_is_answered_without_calling_the_view(self):
        response = self.client.options('/api/probe', HTTP_HOST=HOST,
                                       HTTP_ORIGIN=ORIGIN,
                                       HTTP_ACCESS_CONTROL_REQUEST_METHOD='DELETE',
                                       HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'')
        self.assertEqual(response['Access-Control-Allow-Origin'], ORIGIN)
        self.assertIn('DELETE', response['Access-Control-Allow-Methods'])
        self.assertIn('content-type', response['Access-Control-Allow-Headers'])
        self.assertNotIn('Access-Control-Allow-Private-Network', response)

    @override_settings(CORS_ALLOW_PRIVATE_NETWORK=True)
    def test_private_network_preflight_is_limited_to_allowed_origins(self):
        for origin in (ORIGIN, 'https://other.vercel.app'):
            with self.subTest(origin=origin):
                response = self.client.options('/api/probe', HTTP_HOST=HOST,
                                               HTTP_ORIGIN=origin,
                                               HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
                                               HTTP_ACCESS_CONTROL_REQUEST_PRIVATE_NETWORK='true')
                self.assertEqual(response.get('Access-Control-Allow-Private-Network'),
                                 'true' if origin == ORIGIN else None)

    def test_allowed_browser_can_read_validation_and_busy_errors(self):
        for query, status in (('?id=../bad', 400), ('?busy=1', 409)):
            with self.subTest(query=query):
                response = self.client.get('/api/probe' + query, HTTP_HOST=HOST,
                                           HTTP_ORIGIN=ORIGIN)
                self.assertEqual(response.status_code, status)
                self.assertIn('error', response.json())
                self.assertEqual(response['Access-Control-Allow-Origin'], ORIGIN)

    def test_cors_headers_are_limited_to_api_paths(self):
        response = self.client.get('/outside', HTTP_HOST=HOST, HTTP_ORIGIN=ORIGIN)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('Access-Control-Allow-Origin', response)

    def test_environment_configuration_is_opt_in_and_keeps_loopback_hosts(self):
        settings_file = Path(local_settings.__file__)
        with patch.dict(os.environ, {}, clear=True):
            defaults = runpy.run_path(str(settings_file))
        self.assertEqual(defaults['ALLOWED_HOSTS'], ['127.0.0.1', 'localhost'])
        self.assertEqual(defaults['CORS_ALLOWED_ORIGINS'], [])
        self.assertEqual(defaults['CORS_ALLOWED_ORIGIN_REGEXES'], [
            r'^https?://(?:localhost|127\.0\.0\.1)(?::[0-9]+)?$',
        ])
        self.assertFalse(defaults['CORS_ALLOW_PRIVATE_NETWORK'])
        with patch.dict(os.environ, {
            'MUSE_ALLOWED_HOSTS': f' {HOST},second.example-tailnet.ts.net, ',
            'MUSE_ALLOWED_ORIGINS': f' {ORIGIN},https://preview.vercel.app, ',
            'MUSE_ALLOWED_ORIGIN_REGEXES': r' ^https://muse-[a-z0-9-]+\.vercel\.app$ ',
            'MUSE_ALLOW_PRIVATE_NETWORK': '1',
        }):
            configured = runpy.run_path(str(settings_file))
        self.assertEqual(configured['ALLOWED_HOSTS'],
                         ['127.0.0.1', 'localhost', HOST, 'second.example-tailnet.ts.net'])
        self.assertEqual(configured['CORS_ALLOWED_ORIGINS'],
                         [ORIGIN, 'https://preview.vercel.app'])
        self.assertEqual(configured['CORS_ALLOWED_ORIGIN_REGEXES'], [
            r'^https?://(?:localhost|127\.0\.0\.1)(?::[0-9]+)?$',
            r'^https://muse-[a-z0-9-]+\.vercel\.app$',
        ])
        self.assertTrue(configured['CORS_ALLOW_PRIVATE_NETWORK'])
