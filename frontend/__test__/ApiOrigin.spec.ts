export {}

describe('API deployment origin', () => {
  const originalOrigin = process.env.NEXT_PUBLIC_API_URL
  const originalFetch = global.fetch
  const fetchMock = jest.fn()

  beforeEach(() => {
    jest.resetModules()
    global.fetch = fetchMock
    fetchMock.mockReset().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })
  })

  afterEach(() => {
    if (originalOrigin === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalOrigin
    }
    global.fetch = originalFetch
    jest.resetModules()
  })

  it.each([undefined, '', '  '])(
    'keeps local API calls same-origin when configured as %s',
    async (origin) => {
      if (origin === undefined) {
        delete process.env.NEXT_PUBLIC_API_URL
      } else {
        process.env.NEXT_PUBLIC_API_URL = origin
      }
      const { getModel } = require('../utils/calls')
      await getModel('My model', true)
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/get-model?id=My%20model',
        expect.any(Object),
      )
    },
  )

  it('sends reads and training directly to the configured HTTPS backend', async () => {
    process.env.NEXT_PUBLIC_API_URL =
      ' https://ubuntu-host.example-tailnet.ts.net/// '
    const { getModel, trainModel } = require('../utils/calls')
    await getModel('My model', true)
    await trainModel('My model', '10', '20')
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://ubuntu-host.example-tailnet.ts.net/api/get-model?id=My%20model',
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://ubuntu-host.example-tailnet.ts.net/api/train-model?id=My%20model&every=10&steps=20',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
