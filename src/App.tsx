import { useCallback, useEffect, useState } from 'react'
import { clearSession, loadSession, saveSession, type Session } from './api/auth'
import { ContractError, uploadContract } from './api/contracts'
import { AppShell } from './components/AppShell'
import { ServerStatus } from './components/ServerStatus'
import { mockAnalysisResult } from './data/analysisResult'
import { HistoryScreen } from './screens/HistoryScreen'
import { LoginScreen } from './screens/LoginScreen'
import { ResultScreen } from './screens/ResultScreen'
import { UploadScreen } from './screens/UploadScreen'

type Route = 'login' | 'history' | 'upload' | 'result'

const routes: Record<string, Route> = {
  '#/login': 'login',
  '#/upload': 'upload',
  '#/result': 'result',
}
const readRoute = (): Route => routes[location.hash] ?? 'history'

const go = (hash: string) => {
  location.hash = hash
}

// 라우터 도입 전 임시 해시 라우팅: #/login 로그인, #/ 내역(홈), #/upload 계약서 등록, #/result 결과
// 로그인하지 않았으면 어느 주소로 들어와도 로그인 화면을 보여준다.
export function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [session, setSession] = useState<Session | null>(loadSession)

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute())
      document.querySelector('main')?.scrollTo(0, 0)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const screen =
    !session || route === 'login' ? (
      <LoginScreen
        showMockHint={import.meta.env.VITE_USE_MOCK_API !== 'false'}
        onLoggedIn={(data) => {
          saveSession(data)
          setSession(loadSession())
          if (route === 'login') go('#/')
        }}
      />
    ) : route === 'upload' ? (
      <UploadScreen
        onSubmit={async (files) => {
          try {
            await uploadContract(files, session.accessToken)
          } catch (e) {
            if (e instanceof ContractError && e.code === 'UNAUTHORIZED') logout()
            // 서버가 준 안내 문구만 그대로 보여주고, 네트워크·서버 오류는 사용자용 문구로 바꾼다
            throw e instanceof ContractError
              ? e
              : new Error('업로드하지 못했어요. 잠시 후 다시 시도해 주세요.')
          }
          // 분석은 서버에서 비동기로 진행된다(PROCESSING) → 내역에서 상태를 본다
          go('#/')
        }}
        onBack={() => go('#/')}
      />
    ) : route === 'history' ? (
      <HistoryScreen
        accessToken={session.accessToken}
        nickname={session.nickname}
        // TODO: 분석 결과 API(GET /contracts/{id}/analysis) 연결 전까지 결과는 목데이터
        onOpen={() => go('#/result')}
        onNew={() => go('#/upload')}
        onLogout={logout}
        onUnauthorized={logout}
      />
    ) : (
      <ResultScreen result={mockAnalysisResult} onBack={() => go('#/')} />
    )

  return (
    <>
      {import.meta.env.DEV && <ServerStatus />}
      <AppShell>{screen}</AppShell>
    </>
  )
}
