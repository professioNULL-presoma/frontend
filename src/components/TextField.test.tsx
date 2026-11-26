import { render, screen } from '@testing-library/react'
import { TextField } from './TextField'

describe('TextField', () => {
  it('links the label and error message to the input', () => {
    render(<TextField label="이메일" error="이메일 형식이 맞지 않아요" />)
    const input = screen.getByLabelText('이메일')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('이메일 형식이 맞지 않아요')
  })
})
