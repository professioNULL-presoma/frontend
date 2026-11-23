import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }

export function Button({ variant = 'primary', type = 'button', ...rest }: Props) {
  return <button type={type} className={`btn btn--${variant}`} {...rest} />
}
