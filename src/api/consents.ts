import { request } from './client'

/** consent_documents.document_type (backend feat/initial-db-schema) */
export type ConsentDocumentType =
  'SIGNUP_PRIVACY' | 'CONTRACT_PROCESSING' | 'EXPERT_SHARING' | 'RESEARCH_USE'

export type ConsentDocument = {
  id: string
  documentType: ConsentDocumentType
  version: string
  title: string
  content: string
  isRequired: boolean
  /** ISO 8601 */
  effectiveAt: string
}

type Envelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false'

// ⚠️ 목 응답용 자리표시 문구. 실제 약관이 아니며 법무 검토를 거친 문서로 교체해야 한다.
const PLACEHOLDER_NOTICE = '※ 화면 확인용 예시 문구예요. 실제 약관은 서비스 공개 전에 교체돼요.\n\n'
const mockDocuments: Record<'SIGNUP_PRIVACY' | 'CONTRACT_PROCESSING', ConsentDocument> = {
  SIGNUP_PRIVACY: {
    id: '00000000-0000-4000-8000-0000000000a1',
    documentType: 'SIGNUP_PRIVACY',
    version: 'v0.1',
    title: '개인정보 수집·이용 동의',
    isRequired: true,
    effectiveAt: '2026-12-09T00:00:00+09:00',
    content:
      PLACEHOLDER_NOTICE +
      '1. 수집 항목\n이메일, 비밀번호(암호화 저장), 닉네임\n\n' +
      '2. 이용 목적\n회원 식별, 로그인, 분석 내역 제공\n\n' +
      '3. 보관 기간\n회원 탈퇴 시까지. 탈퇴하면 지체 없이 삭제해요.\n\n' +
      '4. 동의를 거부할 권리\n동의하지 않을 수 있어요. 다만 동의하지 않으면 가입할 수 없어요.',
  },
  CONTRACT_PROCESSING: {
    id: '00000000-0000-4000-8000-0000000000a2',
    documentType: 'CONTRACT_PROCESSING',
    version: 'v0.1',
    title: '계약서 이미지 처리 동의',
    isRequired: true,
    effectiveAt: '2026-12-09T00:00:00+09:00',
    content:
      PLACEHOLDER_NOTICE +
      '1. 처리 항목\n계약서 사진·PDF, 사진에서 읽어낸 글자\n\n' +
      '2. 이용 목적\n계약 조건 분석과 결과 제공\n\n' +
      '3. 보관과 삭제\n주민등록번호는 가린 뒤 저장하지 않아요. 원본 사진은 분석이 끝나면 삭제해요.\n\n' +
      '4. 동의를 거부할 권리\n동의하지 않을 수 있어요. 다만 동의하지 않으면 계약서를 분석할 수 없어요.',
  },
}

/** 해당 종류의 현재 시행 중인 동의 문서. 조회 API는 명세 전이라 경로는 가정. */
export async function getConsentDocument(
  type: 'SIGNUP_PRIVACY' | 'CONTRACT_PROCESSING',
): Promise<ConsentDocument> {
  let res: Envelope<ConsentDocument>
  if (useMock) {
    await new Promise((r) => setTimeout(r, 300))
    res = { success: true, data: mockDocuments[type], error: null }
  } else {
    res = await request<Envelope<ConsentDocument>>(`/consent-documents/${type}`)
  }
  if (!res.success) throw new Error(res.error.message)
  return res.data
}
