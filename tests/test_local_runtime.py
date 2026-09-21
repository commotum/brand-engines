"""Regression checks for using the original archive safely on a new machine."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from gpt_2.src import checkpoints
from backend import utils, metadata, local_runtime


def weights(directory, name):
    directory.mkdir(parents=True, exist_ok=True)
    for suffix in ('index', 'meta', 'data-00000-of-00001'):
        (directory / f'{name}.{suffix}').write_text(name)


class CheckpointsTest(unittest.TestCase):
    def test_relocates_docker_checkpoint_and_rejects_sample_only_step(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            weights(root / 'checkpoint/Dril', 'model-400')
            (root / 'checkpoint/Dril/checkpoint').write_text(
                'model_checkpoint_path: "/old/docker/path/Dril/model-400"\n')
            with patch.object(checkpoints, 'CHECKPOINT_DIR', root / 'checkpoint'), patch.object(
                    checkpoints, 'MODEL_DIR', root / 'models'):
                self.assertEqual(Path(checkpoints.resolve('Dril')).name, 'model-400')
                self.assertEqual(Path(checkpoints.resolve('Dril', 400)).name, 'model-400')
                with self.assertRaisesRegex(ValueError, 'No saved weights'):
                    checkpoints.resolve('Dril', 100)

    def test_fork_copies_only_selected_weights_and_preserves_ancestry(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            models, saved = root / 'models', root / 'checkpoint'
            weights(models / 'Dril', 'model.ckpt')
            weights(saved / 'Dril', 'model-100')
            weights(saved / 'Dril', 'model-1000')
            (models / 'Dril/_metadata.json').write_text(json.dumps({
                'core': False, 'history': [{'id': 'Dril', 'steps': 1000}, {'id': '1558M'}]}))
            with patch.multiple(checkpoints, MODEL_DIR=models, CHECKPOINT_DIR=saved), patch.multiple(
                    utils, MODELS_DIR=models, CHECKPOINT_DIR=saved), patch.object(metadata, 'MODELS_DIR', models), patch.object(
                    local_runtime, 'RUN', root / 'run'):
                utils.fork_model('Dril', 'Test', amount=100)
                self.assertEqual(sorted(p.name for p in (models / 'Test').glob('model*')),
                                 ['model-100.data-00000-of-00001', 'model-100.index', 'model-100.meta'])
                history = json.loads((models / 'Test/_metadata.json').read_text())['history']
                self.assertEqual([h['id'] for h in history], ['Test', 'Dril', '1558M'])
                self.assertEqual(history[1]['steps'], 100)
                self.assertEqual(json.loads((models / 'Dril/_metadata.json').read_text())['history'][0]['steps'], 1000)
                with self.assertRaises(ValueError):
                    utils.fork_model('Dril', 'Missing', amount=200)
                self.assertFalse((models / 'Missing').exists())


if __name__ == '__main__':
    unittest.main()
