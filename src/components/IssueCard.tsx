import { useId, useState } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import './IssueCard.css'

export type Issue = {
  id: string
  title: string
  description: string
  /** 계약서 원문 근거 */
  source: { location: string; quote: string }
}

type Props = {
  issue: Issue
  defaultExpanded?: boolean
  added: boolean
  onToggleQuestion: (id: string) => void
}

/** 조항 카드: 헤더 전체가 펼침 버튼, 펼치면 원문 근거와 "질문에 추가" 버튼이 나온다. */
export function IssueCard({ issue, defaultExpanded = false, added, onToggleQuestion }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const panelId = useId()

  return (
    <article className="issue-card">
      <h3 className="issue-card__heading">
        <button
          type="button"
          className="issue-card__toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="t-title-2">{issue.title}</span>
          <Icon name="chevronDown" className={`issue-card__chevron${expanded ? ' is-open' : ''}`} />
        </button>
      </h3>
      <p className="t-body-2 issue-card__desc">{issue.description}</p>

      {expanded ? (
        <div id={panelId} className="issue-card__panel">
          <figure className="issue-card__quote">
            <figcaption className="t-caption">계약서 원문 · {issue.source.location}</figcaption>
            <blockquote className="t-body-2">“{issue.source.quote}”</blockquote>
          </figure>
          <Button
            variant="secondary"
            size="m"
            aria-pressed={added}
            onClick={() => onToggleQuestion(issue.id)}
          >
            <Icon name={added ? 'check' : 'plus'} size={20} strokeWidth={2} />
            {added ? '질문에 추가됨' : '질문에 추가'}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className="issue-card__more t-label-m"
          aria-controls={panelId}
          onClick={() => setExpanded(true)}
        >
          원문 근거 보기
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </button>
      )}
    </article>
  )
}
