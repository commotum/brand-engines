"""Return actionable JSON errors to the local UI and constrain model paths."""
from pathlib import Path
import re

from django.conf import settings
from django.http import JsonResponse
from backend import MODELS_DIR, CHECKPOINT_DIR, GPT_2_PATH


class LocalAPI:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get('Origin')
        if origin and origin not in settings.CORS_ALLOWED_ORIGINS and not any(
                re.fullmatch(pattern, origin)
                for pattern in settings.CORS_ALLOWED_ORIGIN_REGEXES):
            return JsonResponse({'error': 'Origin is not allowed'}, status=403)
        for key in ('id', 'new_id'):
            if key not in request.GET:
                continue
            name = request.GET[key]
            if not name or name.startswith('.') or any(c in name for c in '/\\\x00'):
                return JsonResponse({'error': 'Invalid model name'}, status=400)
            for base in (MODELS_DIR, CHECKPOINT_DIR, Path(GPT_2_PATH) / 'samples'):
                if (Path(base) / name).resolve().parent != Path(base).resolve():
                    return JsonResponse({'error': 'Invalid model path'}, status=400)
        response = self.get_response(request)
        response['Cache-Control'] = 'no-store'
        return response

    def process_exception(self, request, exception):
        if isinstance(exception, (ValueError, OSError, RuntimeError)):
            status = 409 if isinstance(exception, BlockingIOError) else 400
            return JsonResponse({'error': str(exception)}, status=status)
