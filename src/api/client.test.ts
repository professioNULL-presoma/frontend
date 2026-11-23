import { ApiError } from './client'
import { getHealth } from './health'

describe('api client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('calls the backend through /api', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"status":"ok"}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(getHealth()).resolves.toEqual({ status: 'ok' })
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/health')
  })

  it('throws ApiError on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
    await expect(getHealth()).rejects.toBeInstanceOf(ApiError)
  })
})
