import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockAnalysisResult } from '../data/analysisResult'
import { ResultScreen } from './ResultScreen'

describe('ResultScreen', () => {
  it('summarises the contract', () => {
    render(<ResultScreen result={mockAnalysisResult} />)
    expect(screen.getByText(/확인할 조건이/)).toHaveTextContent('3개 있어요')
    expect(screen.getByText('1,000만원')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /꼭 알아야 할 점/ })).toBeInTheDocument()
  })

  it('counts added questions in the bottom CTA', async () => {
    const onShowQuestions = vi.fn()
    render(<ResultScreen result={mockAnalysisResult} onShowQuestions={onShowQuestions} />)
    await userEvent.click(screen.getByRole('button', { name: '질문에 추가' }))
    expect(screen.getByRole('button', { name: '질문에 추가됨' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(screen.getByRole('button', { name: '집주인에게 물어볼 질문 1개 보기' }))
    expect(onShowQuestions).toHaveBeenCalledWith(['restoration'])
  })
})
