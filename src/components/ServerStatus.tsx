import { useEffect, useState } from 'react'
import { getHealth } from '../api/health'
import './ServerStatus.css'

type State = 'checking' | 'ok' | 'down'

const label: Record<State, string> = {
  checking: '서버 확인 중',
  ok: '서버 연결됨',
  down: '서버 연결 안 됨',
}

/** 개발용: 백엔드 /health 응답을 화면 구석에 작게 보여준다. */
export function ServerStatus() {
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    const ctrl = new AbortController()
    getHealth(ctrl.signal)
      .then((h) => setState(h.status === 'ok' ? 'ok' : 'down'))
      .catch(() => {
        if (!ctrl.signal.aborted) setState('down')
      })
    return () => ctrl.abort()
  }, [])

  return (
    <p className={`server-status server-status--${state} t-caption`} role="status">
      <span className="server-status__dot" aria-hidden="true" />
      {label[state]}
    </p>
  )
}
