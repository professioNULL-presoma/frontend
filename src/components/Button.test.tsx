import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>확인</Button>)
    await userEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
