import { render, screen } from '@testing-library/react'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders the screen inside main with the side panels', () => {
    render(
      <AppShell>
        <p>화면</p>
      </AppShell>,
    )
    expect(screen.getByRole('main')).toHaveTextContent('화면')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
