import { useState, type FormEvent } from 'react'
import { AuthError, signup, type LoginData } from '../api/auth'
import { getConsentDocument } from '../api/consents'
import { BottomCTA } from '../components/BottomCTA'
import { Checkbox } from '../components/Checkbox'
import { Icon } from '../components/Icon'
import { TermsSheet } from '../components/TermsSheet'
import { TextField } from '../components/TextField'
import { TopBar } from '../components/TopBar'
import './SignupScreen.css'

type Props = {
  onBack: () => void
  onSignedUp: (data: LoginData) => void
}

type Field = 'email' | 'password' | 'confirm' | 'nickname' | 'consent' | 'form'
type Errors = Partial<Record<Field, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_HINT = '영문과 숫자를 섞어 8자 이상'

export function validateSignup(v: {
  email: string
  password: string
  confirm: string
  nickname: string
  consent: boolean
}): Errors {
  const e: Errors = {}
  if (!v.email.trim()) e.email = '이메일을 입력해 주세요'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = '이메일 형식이 맞지 않아요'
  if (v.password.length < 8 || !/[A-Za-z]/.test(v.password) || !/\d/.test(v.password))
    e.password = `${PASSWORD_HINT}으로 입력해 주세요`
  if (!v.confirm) e.confirm = '비밀번호를 한 번 더 입력해 주세요'
  else if (v.confirm !== v.password) e.confirm = '비밀번호가 서로 달라요'
  const nick = v.nickname.trim()
  if (nick.length < 2 || nick.length > 20) e.nickname = '닉네임은 2~20자로 입력해 주세요'
  if (!v.consent) e.consent = '필수 동의에 체크해 주세요'
  return e
}

export function SignupScreen({ onBack, onSignedUp }: Props) {
  const [values, setValues] = useState({ email: '', password: '', confirm: '', nickname: '' })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [termsOpen, setTermsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    if (errors[key] || errors.form) setErrors((v) => ({ ...v, [key]: undefined, form: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const found = validateSignup({ ...values, consent })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      const doc = await getConsentDocument('SIGNUP_PRIVACY')
      const data = await signup({
        email: values.email.trim(),
        password: values.password,
        nickname: values.nickname.trim(),
        agreedConsentDocumentIds: [doc.id],
      })
      onSignedUp(data)
    } catch (err) {
      if (err instanceof AuthError && err.code === 'EMAIL_ALREADY_EXISTS') {
        setErrors({ email: err.message })
      } else {
        setErrors({
          form:
            err instanceof AuthError
              ? err.message
              : '지금은 가입할 수 없어요. 잠시 후 다시 시도해 주세요.',
        })
      }
      setSubmitting(false)
    }
  }

  return (
    <form className="signup" onSubmit={onSubmit} noValidate>
      <TopBar title="회원가입" onBack={onBack} />
      <div className="signup__body">
        <h2 className="t-h3">
          이메일로
          <br />
          가입해 주세요
        </h2>

        <div className="signup__fields">
          <TextField
            label="이메일"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="example@email.com"
            value={values.email}
            error={errors.email}
            onChange={set('email')}
          />
          <TextField
            label="비밀번호"
            type="password"
            name="new-password"
            autoComplete="new-password"
            value={values.password}
            error={errors.password}
            hint={PASSWORD_HINT}
            onChange={set('password')}
          />
          <TextField
            label="비밀번호 확인"
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={values.confirm}
            error={errors.confirm}
            onChange={set('confirm')}
          />
          <TextField
            label="닉네임"
            name="nickname"
            autoComplete="nickname"
            maxLength={20}
            placeholder="2~20자"
            value={values.nickname}
            error={errors.nickname}
            onChange={set('nickname')}
          />
        </div>

        <div className={`signup__consent${errors.consent ? ' signup__consent--error' : ''}`}>
          <label className="signup__consent-label">
            <Checkbox
              checked={consent}
              aria-haspopup="dialog"
              aria-describedby={errors.consent ? 'signup-consent-error' : undefined}
              onChange={(e) => {
                // 체크는 약관을 열어 "확인"을 눌러야 되고, 해제는 바로 된다
                if (e.target.checked) setTermsOpen(true)
                else setConsent(false)
              }}
            />
            <span className="t-body-2">개인정보 수집·이용 동의 (필수)</span>
          </label>
          <button
            type="button"
            className="signup__terms"
            aria-label="개인정보 수집·이용 동의 내용 보기"
            onClick={() => setTermsOpen(true)}
          >
            <Icon name="chevronRight" size={20} strokeWidth={2} />
          </button>
        </div>
        {errors.consent && (
          <p id="signup-consent-error" className="t-body-3 signup__error">
            {errors.consent}
          </p>
        )}

        {errors.form && (
          <p className="signup__form-error t-body-2" role="alert">
            <Icon name="warn" size={18} strokeWidth={2} />
            {errors.form}
          </p>
        )}
      </div>

      <BottomCTA type="submit" busy={submitting} disabled={submitting}>
        {submitting ? '가입하는 중…' : '가입하기'}
      </BottomCTA>

      <TermsSheet
        type={termsOpen ? 'SIGNUP_PRIVACY' : null}
        onClose={() => setTermsOpen(false)}
        agreeLabel="확인"
        onAgree={() => {
          setConsent(true)
          setErrors((v) => ({ ...v, consent: undefined }))
          setTermsOpen(false)
        }}
      />
    </form>
  )
}
