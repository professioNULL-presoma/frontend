import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders the label with a decorative icon', () => {
    const { container } = render(<Badge tone="warning">주의 2</Badge>)
    expect(screen.getByText('주의 2')).toHaveClass('badge--warning')
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
