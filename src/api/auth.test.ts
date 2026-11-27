import { AuthError, MOCK_ACCOUNT, clearSession, loadSession, login, saveSession } from './auth'

describe('auth (mock)', () => {
  it('logs in with the example account', async () => {
    await expect(login(MOCK_ACCOUNT)).resolves.toMatchObject({ accessToken: 'mock-token' })
  })

  it('rejects wrong credentials with INVALID_CREDENTIALS', async () => {
    const p = login({ email: MOCK_ACCOUNT.email, password: 'nope' })
    await expect(p).rejects.toBeInstanceOf(AuthError)
    await expect(p).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })

  it('stores the session in sessionStorage', () => {
    saveSession({ accessToken: 't', user: { nickname: 'n' } })
    expect(loadSession()).toEqual({ accessToken: 't', nickname: 'n' })
    clearSession()
    expect(loadSession()).toBeNull()
  })
})
