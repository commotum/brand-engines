"""Exercise model lifecycle and validation without touching saved models or a GPU."""
import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.local_settings')
import django
django.setup()
from django.test import Client, SimpleTestCase, override_settings

from backend import local_middleware, local_runtime, metadata, utils
from gpt_2.src import checkpoints


@override_settings(ROOT_URLCONF='backend.urls', ALLOWED_HOSTS=['testserver'])
class ModelAPITest(SimpleTestCase):
    def setUp(self):
        temporary = TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.models = self.root / 'models'
        self.saved = self.root / 'checkpoint'
        self.samples = self.root / 'samples'
        for module in (utils, metadata, local_middleware):
            replacements = dict(MODELS_DIR=self.models, GPT_2_PATH=self.root)
            if hasattr(module, 'CHECKPOINT_DIR'):
                replacements['CHECKPOINT_DIR'] = self.saved
            mocked = patch.multiple(module, **replacements)
            mocked.start()
            self.addCleanup(mocked.stop)
        for mocked in (patch.multiple(checkpoints, MODEL_DIR=self.models, CHECKPOINT_DIR=self.saved),
                       patch.object(local_runtime, 'RUN', self.root / 'run')):
            mocked.start()
            self.addCleanup(mocked.stop)
        self.client = Client()

    def model(self, name='Branch', core=False):
        directory = self.models / name
        directory.mkdir(parents=True)
        if not core:
            (directory / '_metadata.json').write_text(json.dumps({
                'core': False, 'history': [{'id': name, 'steps': 20}, {'id': '124M'}]}))
        for suffix in ('index', 'meta', 'data-00000-of-00001'):
            (directory / f'model.ckpt.{suffix}').write_text('test weights')
        return directory

    def test_fresh_clone_lists_no_models(self):
        response = self.client.get('/api/get-models')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])
        self.assertFalse(self.models.exists())

    def test_model_list_and_details(self):
        self.model()
        self.model('124M', core=True)
        listed = {item['name']: item for item in self.client.get('/api/get-models').json()}
        self.assertEqual(set(listed), {'124M', 'Branch'})
        self.assertTrue(listed['124M']['core'])
        self.assertFalse(listed['Branch']['core'])
        self.assertEqual(self.client.get('/api/get-model', {'id': 'Branch'}).json(), listed['Branch'])

    def test_rename_moves_weights_samples_and_checkpoint_history(self):
        self.model()
        for directory in (self.saved / 'Branch', self.samples / 'Branch'):
            directory.mkdir(parents=True)
            (directory / 'saved').write_text('retained')
        response = self.client.post('/api/rename-model?id=Branch&new_id=Renamed')
        self.assertEqual(response.json(), {'success': True})
        for directory in (self.models, self.saved, self.samples):
            self.assertFalse((directory / 'Branch').exists())
            self.assertTrue((directory / 'Renamed').is_dir())
        history = metadata.get_metadata('Renamed')['history']
        self.assertEqual([item['id'] for item in history], ['Renamed', '124M'])

    def test_delete_removes_only_branch_and_protects_base_model(self):
        self.model()
        base = self.model('124M', core=True)
        for directory in (self.saved / 'Branch', self.samples / 'Branch'):
            directory.mkdir(parents=True)
        self.assertEqual(self.client.delete('/api/delete-model?id=124M').status_code, 403)
        self.assertTrue(base.is_dir())
        self.assertEqual(self.client.delete('/api/delete-model?id=Branch').json(), {'success': True})
        for directory in (self.models, self.saved, self.samples):
            self.assertFalse((directory / 'Branch').exists())

    def test_fork_retains_source_and_records_uploaded_dataset(self):
        source = self.model('124M', core=True)
        with patch.object(utils, 'encode_dataset', return_value=True) as encode:
            response = self.client.post('/api/fork-model?id=124M&new_id=New&fileName=copy.txt',
                                        'Example copy', content_type='text/plain')
        self.assertEqual(response.json(), {'success': True})
        self.assertTrue(source.is_dir())
        self.assertTrue((self.models / 'New/model.ckpt.index').is_file())
        encode.assert_called_once_with('New', 'Example copy')
        history = metadata.get_metadata('New')['history']
        self.assertEqual([item['id'] for item in history], ['New', '124M'])
        self.assertEqual(history[0]['file'], 'copy.txt')
        self.assertEqual(self.client.post('/api/fork-model?id=124M&new_id=New', 'copy',
                                         content_type='text/plain').status_code, 400)

    def test_samples_include_losses_filter_steps_and_allow_deleted_ancestors(self):
        self.model()
        (self.samples / 'Branch').mkdir(parents=True)
        (self.saved / 'Branch').mkdir(parents=True)
        (self.samples / 'Branch/samples-10').write_text(
            '======== SAMPLE 1 ========\nFirst\n======== SAMPLE 2 ========\nSecond')
        (self.samples / 'Branch/samples-20').write_text('Later')
        (self.saved / 'Branch/metadata-10.json').write_text(json.dumps({'loss': 1.2, 'avg_loss': 1.3}))
        response = self.client.get('/api/get-model-steps', {'id': 'Branch', 'amount': 10})
        self.assertEqual(response.json(), {'10': {'data': ['First\n', 'Second'], 'loss': 1.2, 'avg_loss': 1.3}})
        self.assertEqual(self.client.get('/api/get-model-steps', {'id': 'Deleted'}).json(), {})

    def test_training_logs_are_bounded_and_optional(self):
        directory = self.model()
        self.assertEqual(self.client.get('/api/read-train-model', {'id': 'Branch'}).json(), [])
        (directory / 'output.log').write_text('one\ntwo\nthree\n')
        self.assertEqual(self.client.get('/api/read-train-model', {'id': 'Branch', 'amount': 2}).json(),
                         ['two', 'three'])

    def test_generation_uses_worker_and_validates_parameters(self):
        self.model()
        with patch.object(utils, 'run_worker', return_value=['======== SAMPLE 1 ========\n', 'Hello']) as worker:
            response = self.client.get('/api/generate-model', {'id': 'Branch', 'length': 20, 'input': 'Test'})
            self.assertEqual(response.json(), 'Hello')
            self.assertEqual(worker.call_args.args[0], 'generate')
            self.assertEqual(worker.call_args.args[1]['length'], 20)
            self.assertEqual(worker.call_args.args[1]['input'], 'Test')
            worker.reset_mock()
            self.assertEqual(self.client.get('/api/generate-model', {'id': 'Branch', 'length': 0}).status_code, 400)
            worker.assert_not_called()

    def test_training_requires_dataset_and_clears_busy_state_on_failure(self):
        directory = self.model()
        url = '/api/train-model?id=Branch&steps=1&every=1'
        self.assertEqual(self.client.post(url).status_code, 400)
        (directory / 'dataset.npz').write_text('placeholder')
        with patch.object(utils, 'run_worker', side_effect=RuntimeError('worker stopped')):
            response = self.client.post(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn('worker stopped', response.json()['error'])
        self.assertFalse(metadata.get_metadata('Branch')['training'])
        self.assertIn('Training failed', (directory / 'output.log').read_text())

    def test_required_parameters_and_missing_models(self):
        for method, url in (
                ('get', '/api/get-model'), ('post', '/api/rename-model?id=x'),
                ('post', '/api/fork-model?id=x&new_id=y'), ('delete', '/api/delete-model'),
                ('post', '/api/train-model?id=x'), ('get', '/api/generate-model'),
                ('get', '/api/get-model-steps'), ('get', '/api/read-train-model?id=Missing')):
            with self.subTest(url=url):
                response = getattr(self.client, method)(url)
                self.assertEqual(response.status_code, 400)
                self.assertIn('error', response.json())
