import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('toggles via its label', async () => {
    const onChange = vi.fn()
    render(
      <label>
        <Checkbox onChange={onChange} /> 동의
      </label>,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: '동의' }))
    expect(onChange).toHaveBeenCalledOnce()
  })
})
