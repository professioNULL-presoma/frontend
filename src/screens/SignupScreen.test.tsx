import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MOCK_ACCOUNT } from '../api/auth'
import { SignupScreen, validateSignup } from './SignupScreen'

const fill = async (email: string) => {
  await userEvent.type(screen.getByLabelText('이메일'), email)
  await userEvent.type(screen.getByLabelText('비밀번호'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'abcd1234')
  await userEvent.type(screen.getByLabelText('닉네임'), '새내기')
}

const agree = async () => {
  await userEvent.click(screen.getByRole('checkbox', { name: /개인정보 수집·이용 동의/ }))
  await userEvent.click(await screen.findByRole('button', { name: '확인' }))
}

describe('validateSignup', () => {
  it('checks every field', () => {
    expect(
      validateSignup({
        email: 'x',
        password: 'short',
        confirm: 'diff',
        nickname: 'a',
        consent: false,
      }),
    ).toEqual({
      email: '이메일 형식이 맞지 않아요',
      password: '영문과 숫자를 섞어 8자 이상으로 입력해 주세요',
      confirm: '비밀번호가 서로 달라요',
      nickname: '닉네임은 2~20자로 입력해 주세요',
      consent: '필수 동의에 체크해 주세요',
    })
  })
})

describe('SignupScreen', () => {
  it('requires consent, then signs up and logs in', async () => {
    const onSignedUp = vi.fn()
    render(<SignupScreen onBack={() => {}} onSignedUp={onSignedUp} />)
    await fill('new@jipsa.kr')
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }))
    expect(screen.getByText('필수 동의에 체크해 주세요')).toBeInTheDocument()
    await agree()
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }))
    await vi.waitFor(() => expect(onSignedUp).toHaveBeenCalledOnce(), { timeout: 3000 })
    expect(onSignedUp.mock.calls[0]?.[0]).toMatchObject({ user: { nickname: '새내기' } })
  })

  it('shows the duplicate email error on the email field', async () => {
    render(<SignupScreen onBack={() => {}} onSignedUp={() => {}} />)
    await fill(MOCK_ACCOUNT.email)
    await agree()
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }))
    await vi.waitFor(
      () =>
        expect(screen.getByLabelText('이메일')).toHaveAccessibleDescription(
          '이미 가입된 이메일이에요.',
        ),
      { timeout: 3000 },
    )
  })

  it('checks consent only after 확인 in the terms sheet, unchecks right away', async () => {
    render(<SignupScreen onBack={() => {}} onSignedUp={() => {}} />)
    const box = screen.getByRole('checkbox', { name: /개인정보 수집·이용 동의/ })
    await userEvent.click(box)
    await screen.findByRole('dialog', { name: '개인정보 수집·이용 동의' })
    expect(box).not.toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(box).not.toBeChecked()
    await agree()
    expect(box).toBeChecked()
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(box)
    expect(box).not.toBeChecked()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
