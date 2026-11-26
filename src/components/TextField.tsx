import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './TextField.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: string
  error?: string
  /** 오류가 없을 때 아래에 보이는 안내 */
  hint?: string
  /** 입력칸 오른쪽 안쪽에 두는 버튼 등 (예: 비밀번호 보기) */
  trailing?: ReactNode
}

/** toss.md text-field: 48px, r12, grey-100 바탕 → focus 흰 바탕 + 1.5px blue, error 1.5px red + 아래 helper. */
export function TextField({ label, error, hint, trailing, id, className, ...rest }: Props) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined
  return (
    <div className={['field', error && 'field--error', className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className="field__label t-label-s">
        {label}
      </label>
      <div className="field__control">
        <input
          id={inputId}
          className="field__input t-body-1"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {trailing && <span className="field__trailing">{trailing}</span>}
      </div>
      {error ? (
        <p id={errorId} className="field__error t-body-3">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="field__hint t-body-3">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
