import { render, screen } from '@testing-library/react'
import { ServerStatus } from './ServerStatus'

describe('ServerStatus', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows connected when /health is ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"status":"ok"}', { status: 200 })),
    )
    render(<ServerStatus />)
    expect(await screen.findByText('서버 연결됨')).toBeInTheDocument()
  })

  it('shows disconnected when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
    render(<ServerStatus />)
    expect(await screen.findByText('서버 연결 안 됨')).toBeInTheDocument()
  })
})
