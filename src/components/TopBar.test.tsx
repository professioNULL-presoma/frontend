import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('shows the title and calls onBack', async () => {
    const onBack = vi.fn()
    render(<TopBar title="분석 결과" onBack={onBack} />)
    expect(screen.getByRole('heading', { name: '분석 결과' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '뒤로 가기' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
