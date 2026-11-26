import { ApiError, request } from './client'

/**
 * POST /auth/login — harness/docs/api.md 기준 (현재 "설계 중").
 * 응답은 공통 형식 { success, data, error } 로 감싸서 온다.
 */
export type LoginRequest = { email: string; password: string }
export type LoginData = { accessToken: string; user: { nickname: string } }
type Envelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

export class AuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false'

/** 목 응답에서만 통하는 예시 계정 (실제 계정 아님) */
export const MOCK_ACCOUNT = { email: 'demo@jipsa.kr', password: 'jipsa1234' } as const

async function mockLogin({ email, password }: LoginRequest): Promise<Envelope<LoginData>> {
  await new Promise((r) => setTimeout(r, 400))
  if (email === MOCK_ACCOUNT.email && password === MOCK_ACCOUNT.password) {
    return {
      success: true,
      data: { accessToken: 'mock-token', user: { nickname: '석현' } },
      error: null,
    }
  }
  return {
    success: false,
    data: null,
    error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 맞지 않아요.' },
  }
}

export async function login(body: LoginRequest): Promise<LoginData> {
  let res: Envelope<LoginData>
  if (useMock) {
    res = await mockLogin(body)
  } else {
    try {
      res = await request<Envelope<LoginData>>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        throw new AuthError('INVALID_CREDENTIALS', '이메일 또는 비밀번호가 맞지 않아요.')
      }
      throw e
    }
  }
  if (!res.success) throw new AuthError(res.error.code, res.error.message)
  return res.data
}

// 세션: 탭을 닫으면 사라지는 sessionStorage 에 둔다 (뼈대 단계).
const KEY = 'jipsa.session'
export type Session = { accessToken: string; nickname: string }

export function saveSession(data: LoginData) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify({ accessToken: data.accessToken, nickname: data.user.nickname }),
  )
}
export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}
export function clearSession() {
  sessionStorage.removeItem(KEY)
}
