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

/** contracts.processing_status (backend feat/initial-db-schema) */
export type ProcessingStatus =
  'UPLOADED' | 'OCR_PROCESSING' | 'EXTRACTING' | 'REVIEWING' | 'COMPLETED' | 'FAILED'

/** GET /contracts 목록 한 줄. 응답 상세는 명세 확정 전 가정. */
export type ContractSummary = {
  id: string
  title: string | null
  processingStatus: ProcessingStatus
  /** ISO 8601 */
  createdAt: string
}

// 목 응답용 메모리 저장소 (새로고침하면 처음 상태로 돌아간다)
const mockContracts: ContractSummary[] = [
  {
    id: '00000000-0000-4000-8000-000000000003',
    title: '부산 금정구 원룸',
    processingStatus: 'COMPLETED',
    createdAt: '2026-11-20T14:12:00+09:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    title: '부산 남구 오피스텔',
    processingStatus: 'FAILED',
    createdAt: '2026-11-18T10:40:00+09:00',
  },
]

/** 테스트용: 목 저장소를 비우거나 채운다 */
export function setMockContracts(list: ContractSummary[]) {
  mockContracts.splice(0, mockContracts.length, ...list)
}

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
  const contractId = crypto.randomUUID()
  mockContracts.unshift({
    id: contractId,
    title: null,
    processingStatus: 'REVIEWING',
    createdAt: new Date().toISOString(),
  })
  return { success: true, data: { contractId, status: 'PROCESSING' }, error: null }
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

/** GET /contracts — 내 계약서 목록, 최신순 */
export async function listContracts(accessToken: string): Promise<ContractSummary[]> {
  let res: Envelope<ContractSummary[]>
  if (useMock) {
    await new Promise((r) => setTimeout(r, 500))
    res = { success: true, data: [...mockContracts], error: null }
  } else {
    try {
      res = await request<Envelope<ContractSummary[]>>('/contracts', {
        headers: { Authorization: `Bearer ${accessToken}` },
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
