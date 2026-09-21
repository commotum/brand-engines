# Run Brand Engines locally

The local launcher runs the original Next.js interface and Django API. The
repository includes the application, training code, and curated outputs in
[`sample-archive/`](../sample-archive/). Fine-tuned brand weights and training
datasets are not included, so a fresh checkout will not reproduce the branded
engines shown in the video. The sample collections can be read without installing
anything.

## Prerequisites

The setup below targets Linux x86-64 with Python 3.11, `uv`, Node.js 22, and npm.
Native Windows and macOS are not validated by this setup. The frontend retains
its original Next.js 10 / React 17 stack; the launcher supplies the OpenSSL
compatibility option it needs on Node 22.

Opening the interface and browsing locally available history do not require a
GPU. Live generation and training require an NVIDIA GPU, a compatible driver,
the additional GPU dependencies below, and model weights. The worker reports an
error if TensorFlow cannot see a GPU; it does not silently fall back to CPU.

## Install and launch

Run these commands from the repository root:

```bash
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python -r run/requirements.txt
npm --prefix frontend ci --legacy-peer-deps
npm run local
```

Open <http://127.0.0.1:3017>. The launcher starts the UI on port 3017 and the API
on port 8017, both bound to this machine. Stop them with Ctrl+C. No `.env` file,
database migration, hosted service, or external drive is needed.

On subsequent runs, use `npm run local`. A fresh checkout initially shows
**No models available**; the curated CSV samples are separate from the live app's
model history.

## Generate and train

Install the GPU dependencies into the same environment. These supply the CUDA
12.2 libraries used by TensorFlow 2.15.1; the NVIDIA driver must already be
installed on the host.

```bash
uv pip install --python .venv/bin/python -r run/requirements-gpu.txt
npm run download-models
npm run local
```

The download command fetches the public GPT-2 124M base model into
`gpt_2/data/models/124M/`. It is a general text model, not a fine-tuned brand
engine. To choose a larger base model, run the downloader directly, for example:

```bash
.venv/bin/python gpt_2/download_model.py 355M
```

The other supported sizes are 774M and 1558M. The 124M weight file alone is about
498 MB; allow additional space for its tokenizer, metadata, and any branches or
training checkpoints. Start with 124M to limit memory and storage requirements.
The original 1.5B workflow was exercised on an
RTX A6000; this is not a minimum-memory guarantee for other GPUs.

In the app:

1. Choose **Generate** on a model to try live text generation.
2. Choose **Train → Create New Branch**, name the branch, and upload your own
   UTF-8 `.txt` training data. Use several thousand tokens or more: training
   samples 1,024-token windows, so a few example lines are not sufficient.
3. On the new branch, choose **Train → Continue Training**. Set **Timesteps** to
   the number of additional optimizer updates and **Checkpoint every** to the
   save/sample interval. Start with a short run to check your hardware.
4. Use **History** to inspect saved samples and branch or generate from a chosen
   checkpoint. Create another branch with a new dataset to try the sequential
   fine-tuning workflow described in the README.

Only one model operation runs at a time; browsing remains available during
training. Each sampling interval produces three long samples, which adds time
even to a short training run.

## Existing models and storage

If you already have an original model archive, keep its related directories
together under `gpt_2/data/`:

```text
gpt_2/data/
  models/<name>/       tokenizer, configuration, initial weights, dataset, metadata
  checkpoint/<name>/  later saved weights and training step metadata
  samples/<name>/     text samples from training
```

These directories are ignored by Git. The runtime resolves old absolute Docker
checkpoint paths against local files. A history step with samples but no saved
weights can be browsed, but cannot be generated from or branched.

Branching copies the selected weights rather than the full checkpoint history.
Checkpoints are retained: a 1.5B save is about 6.2 GB, so leave room for every
requested save and branch. Disk-space checks run before training and saving.

Training progress is available in the app and in
`gpt_2/data/models/<name>/output.log`. Low-level output from the latest model
worker is in `.local-run/worker.log`. If a job fails, check that log for GPU,
memory, or checkpoint errors.

## Runtime compatibility and checks

The current environment uses TensorFlow 2.15.1's TF1 graph compatibility APIs and
Django 5.2. Model architecture, tokenizer, checkpoint variable names, and the
original sampling workflow are retained. A small compatibility class replaces
the removed `contrib.HParams`, and transformer blocks use activation
recomputation to reduce training memory use.

Training performs the requested number of additional optimizer updates, with
saves and samples after the corresponding update, including the final step.
Old checkpoint labels are not renumbered. Defaults remain batch size 1,
1,024-token training windows, and an Adam learning rate of 0.00002.

Saved checkpoints contain model weights, not Adam's optimizer state. Continuing
training starts a fresh optimizer and is not an exact continuation of an
uninterrupted run.

Run the Python and frontend regression checks from the repository root:

```bash
npm test
DJANGO_SETTINGS_MODULE=backend.local_settings .venv/bin/python manage.py check
```

These checks cover runtime behavior and small synthetic model computations;
they do not establish GPU capacity or reproduce the archived brand results.
