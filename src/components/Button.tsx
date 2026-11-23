import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  /** toss.md: XL 56/r16, L 48/r14, M 40/r12 */
  size?: 'xl' | 'l' | 'm'
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'l',
  block = false,
  type = 'button',
  className,
  ...rest
}: Props) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={cls} {...rest} />
}
