import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setMockContracts, type ContractSummary } from '../api/contracts'
import { HistoryScreen, formatDate } from './HistoryScreen'

const c = (over: Partial<ContractSummary>): ContractSummary => ({
  id: crypto.randomUUID(),
  title: '부산 금정구 원룸',
  processingStatus: 'COMPLETED',
  createdAt: '2026-11-20T14:12:00+09:00',
  ...over,
})

const setup = () => {
  const props = {
    accessToken: 't',
    onOpen: vi.fn(),
    onNew: vi.fn(),
    onLogout: vi.fn(),
    onUnauthorized: vi.fn(),
  }
  render(<HistoryScreen {...props} />)
  return props
}

describe('HistoryScreen', () => {
  it('formats dates in KST', () => {
    expect(formatDate('2026-11-20T23:30:00Z')).toBe('2026.11.21')
  })

  it('lists contracts with their status and opens completed ones', async () => {
    const done = c({})
    setMockContracts([c({ title: null, processingStatus: 'REVIEWING' }), done])
    const props = setup()
    await screen.findByRole('heading', { name: '내 계약서' })
    const list = screen.getByRole('list')
    const rows = within(list).getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent('제목 없는 계약서')
    expect(rows[0]).toHaveTextContent('분석 중')
    expect(within(rows[0]!).queryByRole('button')).toBeNull()
    await userEvent.click(within(rows[1]!).getByRole('button'))
    expect(props.onOpen).toHaveBeenCalledWith(done)
  })

  it('sends failed contracts to a new upload', async () => {
    setMockContracts([c({ processingStatus: 'FAILED' })])
    const props = setup()
    await userEvent.click(await screen.findByRole('button', { name: /분석 실패/ }))
    expect(props.onNew).toHaveBeenCalledOnce()
  })

  it('shows the empty state', async () => {
    setMockContracts([])
    setup()
    expect(await screen.findByText('아직 분석한 계약서가 없어요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '새 계약서 분석하기' })).toBeInTheDocument()
  })
})
