import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './Badge.css'

export type Tone = 'warning' | 'caution' | 'safe'

const toneIcon: Record<Tone, IconName> = { warning: 'warn', caution: 'info', safe: 'check' }

type Props = { tone: Tone; children: ReactNode }

/** toss.md badge: 22px 높이, 6px radius, washed 배경 + 아이콘(색만으로 구분하지 않음). */
export function Badge({ tone, children }: Props) {
  return (
    <span className={`badge badge--${tone} t-label-s`}>
      <Icon name={toneIcon[tone]} size={12} strokeWidth={2.5} />
      {children}
    </span>
  )
}
