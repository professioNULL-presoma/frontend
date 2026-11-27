import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MOCK_ACCOUNT } from '../api/auth'
import { LoginScreen } from './LoginScreen'

const fill = async (email: string, password: string) => {
  if (email) await userEvent.type(screen.getByLabelText('이메일'), email)
  if (password) await userEvent.type(screen.getByLabelText('비밀번호'), password)
}

describe('LoginScreen', () => {
  it('validates fields before calling the API', async () => {
    const onLoggedIn = vi.fn()
    render(<LoginScreen onLoggedIn={onLoggedIn} />)
    await fill('not-an-email', '')
    await userEvent.click(screen.getByRole('button', { name: '로그인' }))
    expect(screen.getByLabelText('이메일')).toHaveAccessibleDescription('이메일 형식이 맞지 않아요')
    expect(screen.getByLabelText('비밀번호')).toHaveAccessibleDescription(
      '비밀번호를 입력해 주세요',
    )
    expect(onLoggedIn).not.toHaveBeenCalled()
  })

  it('logs in with the example account (Enter submits)', async () => {
    const onLoggedIn = vi.fn()
    render(<LoginScreen onLoggedIn={onLoggedIn} />)
    await fill(MOCK_ACCOUNT.email, `${MOCK_ACCOUNT.password}{Enter}`)
    expect(await screen.findByRole('button', { name: '로그인 중…' })).toBeDisabled()
    await vi.waitFor(() => expect(onLoggedIn).toHaveBeenCalledOnce())
    expect(onLoggedIn.mock.calls[0]?.[0]).toMatchObject({ accessToken: 'mock-token' })
  })

  it('shows the server error for wrong credentials', async () => {
    render(<LoginScreen onLoggedIn={() => {}} />)
    await fill(MOCK_ACCOUNT.email, 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: '로그인' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이메일 또는 비밀번호가 맞지 않아요.',
    )
    expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled()
  })

  it('toggles password visibility', async () => {
    render(<LoginScreen onLoggedIn={() => {}} />)
    const pw = screen.getByLabelText('비밀번호')
    expect(pw).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: '비밀번호 보기' }))
    expect(pw).toHaveAttribute('type', 'text')
  })
})
