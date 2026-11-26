import { useState, type FormEvent } from 'react'
import { AuthError, MOCK_ACCOUNT, login, type LoginData } from '../api/auth'
import { BottomCTA } from '../components/BottomCTA'
import { Icon } from '../components/Icon'
import { TextField } from '../components/TextField'
import './LoginScreen.css'

type Props = {
  onLoggedIn: (data: LoginData) => void
  /** 목 응답일 때 예시 계정 안내를 보여준다 */
  showMockHint?: boolean
}

type Errors = { email?: string; password?: string; form?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email: string, password: string): Errors {
  const e: Errors = {}
  if (!email.trim()) e.email = '이메일을 입력해 주세요'
  else if (!EMAIL_RE.test(email.trim())) e.email = '이메일 형식이 맞지 않아요'
  if (!password) e.password = '비밀번호를 입력해 주세요'
  return e
}

export function LoginScreen({ onLoggedIn, showMockHint = false }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const found = validate(email, password)
    setErrors(found)
    if (found.email || found.password) return

    setSubmitting(true)
    try {
      onLoggedIn(await login({ email: email.trim(), password }))
    } catch (err) {
      setErrors({
        form:
          err instanceof AuthError
            ? err.message
            : '지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요.',
      })
      setSubmitting(false)
    }
  }

  return (
    <form className="login" onSubmit={onSubmit} noValidate>
      <div className="login__body">
        <div className="login__headline">
          <p className="t-label-m login__brand">집사</p>
          <h1 className="t-h3">
            계약서를 확인하려면
            <br />
            로그인해 주세요
          </h1>
        </div>

        <div className="login__fields">
          <TextField
            label="이메일"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="example@email.com"
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email || errors.form)
                setErrors((v) => ({ ...v, email: undefined, form: undefined }))
            }}
          />
          <TextField
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password || errors.form)
                setErrors((v) => ({ ...v, password: undefined, form: undefined }))
            }}
            trailing={
              <button
                type="button"
                className="login__reveal"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={22} />
              </button>
            }
          />
        </div>

        {errors.form && (
          <p className="login__form-error t-body-2" role="alert">
            <Icon name="warn" size={18} strokeWidth={2} />
            {errors.form}
          </p>
        )}

        {showMockHint && (
          <p className="login__hint t-body-3">
            예시 응답으로 동작 중이에요. {MOCK_ACCOUNT.email} / {MOCK_ACCOUNT.password}
          </p>
        )}
      </div>

      <BottomCTA type="submit" busy={submitting} disabled={submitting}>
        {submitting ? '로그인 중…' : '로그인'}
      </BottomCTA>
    </form>
  )
}
