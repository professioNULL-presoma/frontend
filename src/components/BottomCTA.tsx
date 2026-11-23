import type { ReactNode } from 'react'
import { Button } from './Button'
import './BottomCTA.css'

type Props = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  /** toss.md bottom-info: 버튼 위 blue-50 pill 안내 한 줄 */
  info?: ReactNode
}

/** toss.md bottom-cta: 하단 고정 56pt 버튼 + 위쪽 white→transparent 보호 그라디언트. */
export function BottomCTA({ children, onClick, disabled, info }: Props) {
  return (
    <div className="bottom-cta">
      {info && (
        <p className="bottom-cta__info t-label-s" aria-live="polite">
          {info}
        </p>
      )}
      <Button size="xl" block onClick={onClick} disabled={disabled}>
        {children}
      </Button>
    </div>
  )
}
