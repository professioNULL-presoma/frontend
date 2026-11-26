import { useCallback, useEffect, useState } from 'react'
import { ContractError, listContracts, type ContractSummary } from '../api/contracts'
import { Badge, type Tone } from '../components/Badge'
import { BottomCTA } from '../components/BottomCTA'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import './HistoryScreen.css'

type Props = {
  accessToken: string
  nickname?: string
  onOpen: (contract: ContractSummary) => void
  onNew: () => void
  onLogout: () => void
  onUnauthorized: () => void
}

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; contracts: ContractSummary[] }

const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' })
/** ISO → "2026.11.20" */
export const formatDate = (iso: string) => dateFmt.format(new Date(iso)).replaceAll('-', '.')

type View = { tone: Tone; label: string; sub: string; action: 'open' | 'retry' | null }

function view(status: ContractSummary['processingStatus']): View {
  if (status === 'COMPLETED')
    return { tone: 'safe', label: '분석 완료', sub: '결과 보기', action: 'open' }
  if (status === 'FAILED')
    return { tone: 'warning', label: '분석 실패', sub: '다시 올려주세요', action: 'retry' }
  return { tone: 'caution', label: '분석 중', sub: '분석하고 있어요', action: null }
}

export function HistoryScreen({
  accessToken,
  nickname,
  onOpen,
  onNew,
  onLogout,
  onUnauthorized,
}: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  const load = useCallback(
    async (signal?: { cancelled: boolean }) => {
      setState({ kind: 'loading' })
      try {
        const contracts = await listContracts(accessToken)
        if (!signal?.cancelled) setState({ kind: 'ready', contracts })
      } catch (e) {
        if (signal?.cancelled) return
        if (e instanceof ContractError && e.code === 'UNAUTHORIZED') return onUnauthorized()
        setState({ kind: 'error', message: '내역을 불러오지 못했어요.' })
      }
    },
    [accessToken, onUnauthorized],
  )

  useEffect(() => {
    const signal = { cancelled: false }
    // 화면에 들어올 때 목록을 불러온다 (외부 데이터 동기화)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(signal)
    return () => {
      signal.cancelled = true
    }
  }, [load])

  return (
    <div className="history">
      <TopBar
        title="분석 내역"
        action={
          <button type="button" className="history__logout t-label-m" onClick={onLogout}>
            로그아웃
          </button>
        }
      />

      <div className="history__body">
        <div className="history__headline">
          <h2 className="t-h3">
            {nickname ? `${nickname}님이 ` : ''}확인한
            <br />
            계약서예요
          </h2>
        </div>

        {state.kind === 'loading' && (
          <ul className="history__list" aria-busy="true" aria-label="내역 불러오는 중">
            {[0, 1, 2].map((i) => (
              <li key={i} className="history__skeleton" />
            ))}
          </ul>
        )}

        {state.kind === 'error' && (
          <div className="history__empty" role="alert">
            <p className="t-title-2">{state.message}</p>
            <p className="t-body-3 history__muted">잠시 후 다시 시도해 주세요.</p>
            <Button variant="secondary" size="m" onClick={() => void load()}>
              다시 시도
            </Button>
          </div>
        )}

        {state.kind === 'ready' && state.contracts.length === 0 && (
          <div className="history__empty">
            <span className="history__empty-icon">
              <Icon name="file" size={28} />
            </span>
            <p className="t-title-2">아직 분석한 계약서가 없어요</p>
            <p className="t-body-3 history__muted">계약서를 찍어 올리면 여기에 모아둘게요.</p>
          </div>
        )}

        {state.kind === 'ready' && state.contracts.length > 0 && (
          <section aria-labelledby="history-list-title">
            <div className="history__list-head">
              <h3 id="history-list-title" className="t-title-2">
                내 계약서
              </h3>
              <span className="t-label-m history__muted tabular">{state.contracts.length}건</span>
            </div>
            <ul className="history__list">
              {state.contracts.map((c) => {
                const v = view(c.processingStatus)
                const title = c.title ?? '제목 없는 계약서'
                const content = (
                  <>
                    <span className="history__icon">
                      <Icon name="file" size={22} />
                    </span>
                    <span className="history__text">
                      <span className="t-title-2">{title}</span>
                      <span className="t-body-3 history__muted tabular">
                        {formatDate(c.createdAt)} · {v.sub}
                      </span>
                    </span>
                    <Badge tone={v.tone}>{v.label}</Badge>
                  </>
                )
                return (
                  <li key={c.id}>
                    {v.action ? (
                      <button
                        type="button"
                        className="history__row"
                        onClick={() => (v.action === 'open' ? onOpen(c) : onNew())}
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="history__row history__row--static">{content}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <p className="t-body-3 history__muted history__disclaimer">
          집사의 분석은 법률 자문이 아니에요.
          <br />
          중요한 결정 전에는 전문가와 상의하세요.
        </p>
      </div>

      <BottomCTA onClick={onNew}>새 계약서 분석하기</BottomCTA>
    </div>
  )
}
