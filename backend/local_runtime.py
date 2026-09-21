"""Local process isolation: one GPU action at a time, memory freed on exit."""
from contextlib import contextmanager
from functools import wraps
from pathlib import Path
import fcntl
import json
import os
import subprocess
import sys
import sysconfig
import tempfile

ROOT = Path(__file__).resolve().parent.parent
RUN = ROOT / '.local-run'


def environment():
    env = os.environ.copy()
    nvidia = Path(sysconfig.get_paths()['purelib']) / 'nvidia'
    libraries = [str(p) for p in nvidia.glob('*/lib')]
    env['LD_LIBRARY_PATH'] = ':'.join(libraries + [env.get('LD_LIBRARY_PATH', '')])
    env['PATH'] = str(nvidia / 'cuda_nvcc/bin') + ':' + env.get('PATH', '')
    env.setdefault('TF_FORCE_GPU_ALLOW_GROWTH', 'true')
    env.setdefault('TF_CPP_MIN_LOG_LEVEL', '2')
    return env


@contextmanager
def gpu_lock():
    RUN.mkdir(exist_ok=True)
    with (RUN / 'gpu.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise BlockingIOError('A model operation is already running. Wait for it to finish.')
        yield


def exclusive(function):
    @wraps(function)
    def wrapped(*args, **kwargs):
        with gpu_lock():
            return function(*args, **kwargs)
    return wrapped


def run_worker(operation, arguments):
    RUN.mkdir(exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=RUN, suffix='.json') as result:
        with (RUN / 'worker.log').open('w') as log:
            proc = subprocess.run(
                [sys.executable, '-m', 'backend.worker', operation, result.name],
                input=json.dumps(arguments), text=True, stdout=log, stderr=log,
                cwd=ROOT, env=environment())
        if proc.returncode:
            detail = (RUN / 'worker.log').read_text()[-3000:]
            raise RuntimeError(f'GPU job failed. Details in .local-run/worker.log\n{detail}')
        return json.loads(Path(result.name).read_text())
