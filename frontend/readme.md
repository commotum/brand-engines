# Local interface

This is the original Next.js 10 / React 17 interface for managing models,
branching checkpoints, fine-tuning on text files, and generating copy.

Use the repository's [local setup guide](../run/local.md) to install the Python
runtime, model weights, and frontend dependencies. From the repository root,
`npm run local` starts both Django and this interface at
<http://127.0.0.1:3017>.

For frontend-only development, install Node.js 22 and run:

```bash
cd frontend
npm ci --legacy-peer-deps
npm start
```

Model operations still require Django on `127.0.0.1:8017`. The
`pages/api/[operation].ts` route proxies requests to that backend; no environment
file is needed for the local launcher. `.env.example` documents the optional
setting for a separate API origin.

Useful checks:

```bash
npm test       # Component/request tests, TypeScript, and lint
npm run build  # Check the Next.js production build
```

The start and build commands include the OpenSSL compatibility flag needed by
the archived Next.js version on Node.js 22. This interface is intended for local
use; its framework and dependencies have not been modernized for public hosting.
