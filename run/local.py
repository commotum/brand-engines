"""Start the original Django API and Next UI, both on loopback."""
from importlib.util import find_spec
from pathlib import Path
import os
import shutil
import signal
import socket
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def preflight():
    if sys.platform != 'linux':
        raise RuntimeError('The supported local runtime uses Linux. See run/local.md for requirements.')
    missing = [name for name in ('django', 'corsheaders', 'numpy', 'regex', 'tensorflow')
               if find_spec(name) is None]
    if missing:
        raise RuntimeError(f'Missing Python dependencies: {", ".join(missing)}. '
                           'Install run/requirements.txt in .venv as described in run/local.md.')
    if not shutil.which('node'):
        raise RuntimeError('Node.js is missing. Install Node.js 22 as described in run/local.md.')
    if not (ROOT / 'frontend/node_modules/next/dist/bin/next').is_file():
        raise RuntimeError('Frontend dependencies are missing. Run: '
                           'npm --prefix frontend ci --legacy-peer-deps')
    for port in (8017, 3017):
        with socket.socket() as probe:
            probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                probe.bind(('127.0.0.1', port))
            except OSError as error:
                raise RuntimeError(f'Cannot use local port {port}: {error}. '
                                   'Stop the existing process before launching another copy.') from error


def stop(signum, frame):
    raise KeyboardInterrupt


def shutdown(children):
    for child in children:
        if child.poll() is None:
            try:
                os.killpg(child.pid, signal.SIGINT)
            except ProcessLookupError:
                pass
    for child in children:
        try:
            child.wait(timeout=10)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(child.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            child.wait()


def main():
    children = []
    signal.signal(signal.SIGTERM, stop)
    try:
        preflight()
        from backend.local_runtime import environment
        env = environment()
        env.update(DJANGO_SETTINGS_MODULE='backend.local_settings', NEXT_TELEMETRY_DISABLED='1')
        env['NODE_OPTIONS'] = (env.get('NODE_OPTIONS', '') + ' --openssl-legacy-provider').strip()
        children.append(subprocess.Popen([sys.executable, 'manage.py', 'runserver',
                                         '127.0.0.1:8017', '--noreload'],
                                        cwd=ROOT, env=env, start_new_session=True))
        children.append(subprocess.Popen(['node', 'node_modules/next/dist/bin/next', 'dev',
                                         '--hostname', '127.0.0.1', '--port', '3017'],
                                        cwd=ROOT / 'frontend', env=env, start_new_session=True))
        print('Starting Brand Engines at http://127.0.0.1:3017 (API: http://127.0.0.1:8017). '
              'Press Ctrl+C to stop.', flush=True)
        while all(child.poll() is None for child in children):
            time.sleep(0.5)
        print('A local server exited; stopping the other server. See the output above.', file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 0
    except (OSError, RuntimeError) as error:
        print(f'Cannot start Brand Engines: {error}', file=sys.stderr)
        return 1
    finally:
        shutdown(children)


if __name__ == '__main__':
    sys.exit(main())
