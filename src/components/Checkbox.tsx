import type { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'
import './Checkbox.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>

/** toss.md checkbox: 22px, 6px radius. off = 1.5px grey-300 보더, on = blue-500 + 흰 체크. */
export function Checkbox({ className, ...rest }: Props) {
  return (
    <span className={['checkbox', className].filter(Boolean).join(' ')}>
      <input type="checkbox" className="checkbox__input" {...rest} />
      <span className="checkbox__box" aria-hidden="true">
        <Icon name="check" size={16} strokeWidth={2.5} />
      </span>
    </span>
  )
}
