import type { NextApiRequest, NextApiResponse } from 'next'

import http from 'http'

// Keep the original UI/API contract; Django owns the local model operations.
export const config = { api: { bodyParser: false, responseLimit: false } }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  return new Promise<void>((resolve) => {
    const upstream = http.request(
      {
        hostname: '127.0.0.1',
        port: 8017,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: '127.0.0.1:8017' },
      },
      (response) => {
        res.status(response.statusCode || 502)
        res.setHeader(
          'Content-Type',
          response.headers['content-type'] || 'application/json',
        )
        response.pipe(res)
        response.on('end', resolve)
      },
    )
    upstream.on('error', () => {
      if (!res.headersSent) {
        res.status(502).json({ error: 'Local Python backend is unavailable' })
      } else {
        res.end()
      }
      resolve()
    })
    req.pipe(upstream)
  })
}
