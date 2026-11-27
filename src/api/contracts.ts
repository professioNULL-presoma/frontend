import { ApiError, request } from './client'

/**
 * POST /contracts — harness/docs/api.md 기준 (현재 "설계 중").
 * multipart/form-data, 필드 `file`. 여러 페이지는 같은 필드명으로 순서대로 붙인다(명세 확정 필요).
 */
export type UploadResult = { contractId: string; status: 'PROCESSING' }
type Envelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

export class ContractError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ContractError'
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false'

/** 목 응답 기준. 실제 제한은 백엔드와 맞춰야 한다. */
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024
const isAllowed = (f: File) => f.type.startsWith('image/') || f.type === 'application/pdf'

async function mockUpload(files: File[]): Promise<Envelope<UploadResult>> {
  await new Promise((r) => setTimeout(r, 800))
  if (!files.every(isAllowed)) {
    return {
      success: false,
      data: null,
      error: { code: 'INVALID_FILE_TYPE', message: '사진이나 PDF만 올릴 수 있어요.' },
    }
  }
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES) {
    return {
      success: false,
      data: null,
      error: { code: 'FILE_TOO_LARGE', message: '파일이 너무 커요. 20MB 이하로 올려주세요.' },
    }
  }
  return {
    success: true,
    data: { contractId: '00000000-0000-4000-8000-000000000001', status: 'PROCESSING' },
    error: null,
  }
}

export async function uploadContract(files: File[], accessToken: string): Promise<UploadResult> {
  let res: Envelope<UploadResult>
  if (useMock) {
    res = await mockUpload(files)
  } else {
    const body = new FormData()
    files.forEach((f) => body.append('file', f))
    try {
      res = await request<Envelope<UploadResult>>('/contracts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      })
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        throw new ContractError('UNAUTHORIZED', '로그인이 만료됐어요. 다시 로그인해 주세요.')
      }
      throw e
    }
  }
  if (!res.success) throw new ContractError(res.error.code, res.error.message)
  return res.data
}
