import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IssueCard, type Issue } from './IssueCard'

const issue: Issue = {
  id: 'a',
  title: '관리비 포함 항목이 적혀 있지 않음',
  description: '수도·인터넷 포함 여부가 계약서에 없어요.',
  source: { location: '제5조', quote: '관리비는 월 7만원으로 한다.' },
}

describe('IssueCard', () => {
  it('expands to show the source quote', async () => {
    render(<IssueCard issue={issue} added={false} onToggleQuestion={() => {}} />)
    const toggle = screen.getByRole('button', { name: issue.title })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(screen.getByRole('button', { name: '원문 근거 보기' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/관리비는 월 7만원으로 한다/)).toBeInTheDocument()
  })

  it('reports question toggles', async () => {
    const onToggle = vi.fn()
    render(<IssueCard issue={issue} defaultExpanded added={false} onToggleQuestion={onToggle} />)
    await userEvent.click(screen.getByRole('button', { name: '질문에 추가' }))
    expect(onToggle).toHaveBeenCalledWith('a')
  })
})
