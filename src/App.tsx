import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { ServerStatus } from './components/ServerStatus'
import { mockAnalysisResult } from './data/analysisResult'
import { ResultScreen } from './screens/ResultScreen'
import { UploadScreen } from './screens/UploadScreen'

type Route = 'upload' | 'result'

const readRoute = (): Route => (location.hash === '#/result' ? 'result' : 'upload')

// 라우터 도입 전 임시 해시 라우팅: #/ → 02 계약서 등록, #/result → 01 결과
export function App() {
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute())
      document.querySelector('main')?.scrollTo(0, 0)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      {import.meta.env.DEV && <ServerStatus />}
      <AppShell>
        {route === 'upload' ? (
          // TODO: 백엔드 분석 API 연결 — 지금은 바로 목데이터 결과로 이동
          <UploadScreen onSubmit={() => (location.hash = '#/result')} />
        ) : (
          <ResultScreen result={mockAnalysisResult} onBack={() => (location.hash = '#/')} />
        )}
      </AppShell>
    </>
  )
}
