"""Downloader failures cannot publish incomplete weights as ready checkpoints."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import MagicMock, patch

import requests

from backend import MODELS_DIR
from gpt_2 import download_model


class DownloadTest(TestCase):
    def response(self, size=6):
        response = MagicMock()
        response.__enter__.return_value = response
        response.headers = {'content-length': str(size)}
        response.iter_content.return_value = [b'abc', b'def']
        return response

    def test_default_directory_matches_api_from_any_working_directory(self):
        self.assertEqual(download_model.MODELS_DIR, Path(MODELS_DIR).resolve())

    def test_downloads_atomically_and_keeps_existing_files(self):
        with TemporaryDirectory() as temporary, patch.object(download_model, 'FILES', ('model.ckpt.index',)), \
                patch.object(download_model.requests, 'get', return_value=self.response()) as get, \
                patch.object(download_model, 'tqdm'):
            target = download_model.download_model('124M', temporary)
            self.assertEqual((target / 'model.ckpt.index').read_bytes(), b'abcdef')
            self.assertFalse(list(target.glob('*.part')))
            self.assertEqual(get.call_args.args[0], download_model.BASE_URL + '/124M/model.ckpt.index')
            download_model.download_model('124M', temporary)
            self.assertEqual(get.call_count, 1)

    def test_incomplete_download_and_http_failure_leave_no_checkpoint(self):
        for response in (self.response(size=20), self.response()):
            if response.headers['content-length'] == '6':
                response.raise_for_status.side_effect = requests.HTTPError('404')
            with self.subTest(response=response), TemporaryDirectory() as temporary, \
                    patch.object(download_model, 'FILES', ('model.ckpt.index',)), \
                    patch.object(download_model.requests, 'get', return_value=response), \
                    patch.object(download_model, 'tqdm'):
                with self.assertRaises((OSError, requests.HTTPError)):
                    download_model.download_model('124M', temporary)
                self.assertEqual(list((Path(temporary) / '124M').iterdir()), [])
