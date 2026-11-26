import { useEffect, useState } from 'react'
import { getConsentDocument, type ConsentDocument } from '../api/consents'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import './TermsSheet.css'

export type TermsType = 'SIGNUP_PRIVACY' | 'CONTRACT_PROCESSING'

type Props = {
  /** null 이면 닫힘 */
  type: TermsType | null
  onClose: () => void
  /** 넘기면 하단에 "동의하기" 버튼이 생긴다 */
  onAgree?: (doc: ConsentDocument) => void
  /** 동의 버튼 문구 (기본 "동의하기") */
  agreeLabel?: string
}

type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; doc: ConsentDocument }

const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' })

/** 동의 문서(consent_documents) 내용을 바텀시트로 보여준다. */
export function TermsSheet({ type, onClose, onAgree, agreeLabel = '동의하기' }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    if (!type) return
    let cancelled = false
    // 시트를 열 때마다 해당 문서를 불러온다 (외부 데이터 동기화)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ kind: 'loading' })
    getConsentDocument(type)
      .then((doc) => !cancelled && setState({ kind: 'ready', doc }))
      .catch(() => !cancelled && setState({ kind: 'error' }))
    return () => {
      cancelled = true
    }
  }, [type])

  const title = state.kind === 'ready' ? state.doc.title : '약관'

  return (
    <BottomSheet
      open={type !== null}
      title={title}
      onClose={onClose}
      footer={
        onAgree && state.kind === 'ready' ? (
          <Button size="xl" block onClick={() => onAgree(state.doc)}>
            {agreeLabel}
          </Button>
        ) : undefined
      }
    >
      {state.kind === 'loading' && (
        <p className="t-body-2 terms__muted" aria-busy="true">
          불러오는 중이에요
        </p>
      )}
      {state.kind === 'error' && (
        <p className="t-body-2 terms__muted" role="alert">
          내용을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
      {state.kind === 'ready' && (
        <>
          <p className="t-body-3 terms__muted tabular">
            {state.doc.version} ·{' '}
            {dateFmt.format(new Date(state.doc.effectiveAt)).replaceAll('-', '.')} 시행 ·{' '}
            {state.doc.isRequired ? '필수' : '선택'}
          </p>
          <div className="terms__content t-body-2">{state.doc.content}</div>
        </>
      )}
    </BottomSheet>
  )
}
