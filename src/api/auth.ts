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

// 목 응답에서 방금 가입한 계정으로도 로그인되게 메모리에 둔다 (새로고침하면 사라짐)
const mockUsers = new Map<string, { nickname: string; password: string }>()

async function mockLogin({ email, password }: LoginRequest): Promise<Envelope<LoginData>> {
  await new Promise((r) => setTimeout(r, 400))
  if (email === MOCK_ACCOUNT.email && password === MOCK_ACCOUNT.password) {
    return {
      success: true,
      data: { accessToken: 'mock-token', user: { nickname: '석현' } },
      error: null,
    }
  }
  const signedUp = mockUsers.get(email.toLowerCase())
  if (signedUp && signedUp.password === password) {
    return {
      success: true,
      data: { accessToken: 'mock-token', user: { nickname: signedUp.nickname } },
      error: null,
    }
  }
  return {
    success: false,
    data: null,
    error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 맞지 않아요.' },
  }
}

/**
 * POST /auth/signup — api.md 기준 (현재 "설계 중"). 응답 상세는 미정이라
 * 가입 후 같은 정보로 login() 을 불러 토큰을 받는다.
 */
export type SignupRequest = {
  email: string
  password: string
  nickname: string
  /** 동의한 문서 id (consent_documents.id) */
  agreedConsentDocumentIds: string[]
}

async function mockSignup({ email }: SignupRequest): Promise<Envelope<{ userId: string }>> {
  await new Promise((r) => setTimeout(r, 500))
  if (email.toLowerCase() === MOCK_ACCOUNT.email) {
    return {
      success: false,
      data: null,
      error: { code: 'EMAIL_ALREADY_EXISTS', message: '이미 가입된 이메일이에요.' },
    }
  }
  return { success: true, data: { userId: crypto.randomUUID() }, error: null }
}

export async function signup(body: SignupRequest): Promise<LoginData> {
  let res: Envelope<{ userId: string }>
  if (useMock) {
    res = await mockSignup(body)
    if (res.success)
      mockUsers.set(body.email.toLowerCase(), { nickname: body.nickname, password: body.password })
  } else {
    try {
      res = await request<Envelope<{ userId: string }>>('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        throw new AuthError('EMAIL_ALREADY_EXISTS', '이미 가입된 이메일이에요.')
      }
      throw e
    }
  }
  if (!res.success) throw new AuthError(res.error.code, res.error.message)
  return login({ email: body.email, password: body.password })
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
