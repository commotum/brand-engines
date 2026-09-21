"""Resolve copied checkpoints without relying on archived Docker paths."""
from pathlib import Path
import re

from gpt_2.src import MODEL_DIR, CHECKPOINT_DIR


def complete(prefix):
    prefix = Path(prefix)
    shards = list(prefix.parent.glob(prefix.name + '.data-*-of-*'))
    if not prefix.with_name(prefix.name + '.index').is_file() or not shards:
        return False
    expected = int(shards[0].name.rsplit('-of-', 1)[1])
    return all(prefix.with_name(f'{prefix.name}.data-{i:05d}-of-{expected:05d}').is_file()
               for i in range(expected))


def latest(directory):
    directory = Path(directory)
    state = directory / 'checkpoint'
    if state.is_file():
        match = re.search(r'^model_checkpoint_path: "([^"]+)"', state.read_text(), re.M)
        if match:
            prefix = directory / Path(match[1]).name
            if complete(prefix):
                return str(prefix)
    candidates = []
    for file in directory.glob('model-*.index'):
        match = re.fullmatch(r'model-(\d+)\.index', file.name)
        if match and complete(file.with_suffix('')):
            candidates.append((int(match[1]), str(file.with_suffix(''))))
    if candidates:
        return max(candidates)[1]
    base = directory / 'model.ckpt'
    return str(base) if complete(base) else None


def resolve(model_name, step=None):
    if step is not None and int(step) != 0:
        prefix = Path(CHECKPOINT_DIR) / model_name / f'model-{int(step)}'
        if int(step) < 0 or not complete(prefix):
            raise ValueError(f'No saved weights for {model_name} at step {step}; samples alone cannot be resumed.')
        return str(prefix)
    prefix = latest(Path(CHECKPOINT_DIR) / model_name) or latest(Path(MODEL_DIR) / model_name)
    if prefix is None:
        raise ValueError(f'No complete checkpoint for {model_name}')
    return prefix
