import { Icon } from './Icon'
import './TopBar.css'

type Props = { title: string; onBack?: () => void }

export function TopBar({ title, onBack }: Props) {
  return (
    <header className={onBack ? 'topbar' : 'topbar topbar--no-back'}>
      {onBack && (
        <button type="button" className="topbar__back" aria-label="뒤로 가기" onClick={onBack}>
          <Icon name="back" />
        </button>
      )}
      <h1 className="topbar__title t-title-2">{title}</h1>
    </header>
  )
}
