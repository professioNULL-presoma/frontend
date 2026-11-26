import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import './BottomSheet.css'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** 시트 하단 고정 영역 (버튼 등) */
  footer?: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * toss.md bottom-sheet: 모바일 dialog 대체. scrim(bg-overlay) + 위쪽 20px 라운드.
 * 열리면 포커스를 시트 안에 가두고, Esc·바깥 누르기로 닫히며, 닫히면 원래 자리로 포커스를 돌려준다.
 */
export function BottomSheet({ open, title, onClose, children, footer }: Props) {
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const sheet = sheetRef.current
    sheet?.querySelector<HTMLElement>('.sheet__close')?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !sheet) return
      const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="sheet-layer">
      <div className="sheet__scrim" aria-hidden="true" onClick={onClose} />
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="sheet__head">
          <h2 id={titleId} className="t-title-1">
            {title}
          </h2>
          <button type="button" className="sheet__close" aria-label="닫기" onClick={onClose}>
            <Icon name="x" size={22} strokeWidth={2} />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
