import type { ReactNode } from 'react'
import { Button } from './Button'
import './BottomCTA.css'

type Props = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  /** form 안에서 쓸 때 'submit' — Enter 키로도 제출된다 */
  type?: 'button' | 'submit'
  busy?: boolean
  /** toss.md bottom-info: 버튼 위 blue-50 pill 안내 한 줄 */
  info?: ReactNode
}

/** toss.md bottom-cta: 하단 고정 56pt 버튼 + 위쪽 white→transparent 보호 그라디언트. */
export function BottomCTA({ children, onClick, disabled, info, type = 'button', busy }: Props) {
  return (
    <div className="bottom-cta">
      {info && (
        <p className="bottom-cta__info t-label-s" aria-live="polite">
          {info}
        </p>
      )}
      <Button size="xl" block type={type} onClick={onClick} disabled={disabled} aria-busy={busy}>
        {children}
      </Button>
    </div>
  )
}
