import { useState } from 'react'
import { Badge, type Tone } from '../components/Badge'
import { BottomCTA } from '../components/BottomCTA'
import { Icon } from '../components/Icon'
import { IssueCard, type Issue } from '../components/IssueCard'
import { TopBar } from '../components/TopBar'
import { formatManwon, type AnalysisResult } from '../data/analysisResult'
import './ResultScreen.css'

type Props = {
  result: AnalysisResult
  onBack?: () => void
  onShowQuestions?: (issueIds: string[]) => void
  onShowAll?: () => void
}

export function ResultScreen({ result, onBack, onShowQuestions, onShowAll }: Props) {
  const [questions, setQuestions] = useState<string[]>([])
  const toggleQuestion = (id: string) =>
    setQuestions((q) => (q.includes(id) ? q.filter((x) => x !== id) : [...q, id]))

  const { property, money, warnings, cautions, safeCount, totalCount } = result
  const checkCount = warnings.length + cautions.length
  const firstIssueId = warnings[0]?.id ?? cautions[0]?.id

  const section = (title: string, tone: Tone, label: string, sub: string, issues: Issue[]) =>
    issues.length > 0 && (
      <section className="result__section" aria-labelledby={`sec-${tone}`}>
        <div className="result__section-head">
          <h2 id={`sec-${tone}`} className="t-title-1">
            {title} <Badge tone={tone}>{label}</Badge>
          </h2>
          <p className="t-body-3 result__muted">{sub}</p>
        </div>
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            defaultExpanded={issue.id === firstIssueId}
            added={questions.includes(issue.id)}
            onToggleQuestion={toggleQuestion}
          />
        ))}
      </section>
    )

  return (
    <div className="result">
      <TopBar title="분석 결과" onBack={onBack} />

      <section className="result__hero" aria-label="요약">
        <div className="result__headline">
          <p className="t-body-3 result__muted tabular">
            {property.label} · {property.periodStart} ~ {property.periodEnd}
          </p>
          <p className="t-h3">
            계약 전에 확인할 조건이
            <br />
            {checkCount}개 있어요
          </p>
        </div>
        <dl className="result__money">
          {(
            [
              ['보증금', money.deposit],
              ['월세', money.monthlyRent],
              ['관리비', money.maintenanceFee],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="t-caption result__muted">{k}</dt>
              <dd className="t-title-1 tabular">{formatManwon(v)}</dd>
            </div>
          ))}
        </dl>
        <div className="result__badges">
          <Badge tone="warning">주의 {warnings.length}</Badge>
          <Badge tone="caution">확인 {cautions.length}</Badge>
          <Badge tone="safe">양호 {safeCount}</Badge>
        </div>
      </section>

      {section(
        '꼭 알아야 할 점',
        'warning',
        '주의',
        '계약 전에 내 부담이 되는 조건이에요.',
        warnings,
      )}
      {section(
        '집주인과 상의할 점',
        'caution',
        '확인',
        '바로 거절할 조건은 아니지만, 미리 확인하면 좋아요.',
        cautions,
      )}

      <div className="result__divider" />
      <button type="button" className="result__safe-row" onClick={onShowAll}>
        <span className="result__safe-icon">
          <Icon name="check" size={22} strokeWidth={2} />
        </span>
        <span className="result__safe-text">
          <span className="t-title-2">양호 {safeCount}개 항목은 문제없어요</span>
          <span className="t-body-3 result__muted">전체 {totalCount}개 항목 보기</span>
        </span>
        <Icon name="chevronRight" size={20} strokeWidth={2} className="result__chev" />
      </button>

      <p className="t-body-3 result__muted result__disclaimer">
        집사의 분석은 법률 자문이 아니에요.
        <br />
        중요한 결정 전에는 전문가와 상의하세요.
      </p>

      <BottomCTA onClick={() => onShowQuestions?.(questions)}>
        {questions.length > 0
          ? `집주인에게 물어볼 질문 ${questions.length}개 보기`
          : '집주인에게 물어볼 질문 보기'}
      </BottomCTA>
    </div>
  )
}
