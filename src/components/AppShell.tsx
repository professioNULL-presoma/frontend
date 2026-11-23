import type { ReactNode } from 'react'
import './AppShell.css'

const steps = [
  ['계약서 촬영', '개인정보는 가리고 저장해요'],
  ['조건 정리', '보증금·월세·특약을 항목별로 정리해요'],
  ['질문 만들기', '집주인에게 물어볼 내용까지 만들어요'],
] as const

/** 모바일은 화면만, 데스크톱(≥1024px)은 좌측 브랜드 · 가운데 390 폰 · 우측 안내 3단. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="shell__side shell__side--left" aria-label="서비스 소개">
        <p className="t-h1 shell__brand">집사</p>
        <p className="t-h2">
          처음 보는 계약서,
          <br />
          집사가 먼저 읽어드려요
        </p>
        <p className="t-body-1 shell__sub">
          첫 원룸 계약 당일, 사진 한 장으로
          <br />내 부담과 확인할 조건을 알려드려요.
        </p>
      </aside>

      <main className="shell__phone">{children}</main>

      <aside className="shell__side shell__side--right" aria-labelledby="shell-steps">
        <h2 id="shell-steps" className="t-title-1">
          이렇게 읽어드려요
        </h2>
        <ol className="shell__steps">
          {steps.map(([title, sub], i) => (
            <li key={title} className="shell__step">
              <span className="shell__num t-label-m" aria-hidden="true">
                {i + 1}
              </span>
              <span className="shell__step-text">
                <span className="t-title-2">{title}</span>
                <span className="t-body-3 shell__muted">{sub}</span>
              </span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
