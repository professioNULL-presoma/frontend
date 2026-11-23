import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomCTA } from './BottomCTA'

describe('BottomCTA', () => {
  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<BottomCTA onClick={onClick}>다음</BottomCTA>)
    await userEvent.click(screen.getByRole('button', { name: '다음' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
