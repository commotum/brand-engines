import { getModel, readTrainModel, trainModel } from '../utils/calls'

describe('training HTTP evidence', () => {
  const originalFetch = global.fetch
  const fetchMock = jest.fn()
  let alert: jest.SpyInstance

  beforeEach(() => {
    global.fetch = fetchMock
    fetchMock.mockReset()
    alert = jest.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    global.fetch = originalFetch
    alert.mockRestore()
  })

  it.each([400, 403, 409])(
    'recognizes explicit backend errors on %s',
    async (status) => {
      fetchMock.mockResolvedValue({
        ok: false,
        status,
        json: async () => ({ error: 'Backend rejected training' }),
      })
      await expect(trainModel('model', '10', '20')).rejects.toMatchObject({
        message: 'Backend rejected training',
        trainingFailed: true,
      })
      expect(alert).not.toHaveBeenCalled()
    },
  )

  it.each([500, 502, 503, 504])(
    'does not infer training failure from HTTP %s',
    async (status) => {
      fetchMock.mockResolvedValue({
        ok: false,
        status,
        json: async () => ({ error: 'Gateway failure' }),
      })
      await expect(trainModel('model', '10', '20')).rejects.toMatchObject({
        trainingFailed: false,
      })
    },
  )

  it('does not infer failure from a non-JSON response or lost connection', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => {
        throw new Error('HTML response')
      },
    })
    await expect(trainModel('model', '10', '20')).rejects.toMatchObject({
      trainingFailed: false,
    })
    const disconnected = new Error('Disconnected')
    fetchMock.mockRejectedValueOnce(disconnected)
    await expect(trainModel('model', '10', '20')).rejects.toBe(disconnected)
  })

  it('silently reports status-read failures while preserving default callers', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Unavailable' }),
    })
    await expect(getModel('model', true)).rejects.toThrow('503')
    await expect(readTrainModel('model', true)).rejects.toThrow('503')
    expect(alert).not.toHaveBeenCalled()
    await expect(getModel('model')).resolves.toBeNull()
    expect(alert).toHaveBeenCalledWith('Unavailable')
  })
})
