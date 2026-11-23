import type { Issue } from '../components/IssueCard'

/**
 * 분석 결과 화면에 필요한 데이터 형태.
 * ERD 확정 전 임시 모델 — 백엔드 응답이 정해지면 이 타입을 맞춘다.
 */
export type AnalysisResult = {
  property: { label: string; periodStart: string; periodEnd: string }
  /** 만원 단위 */
  money: { deposit: number; monthlyRent: number; maintenanceFee: number }
  warnings: Issue[]
  cautions: Issue[]
  safeCount: number
  totalCount: number
}

export const mockAnalysisResult: AnalysisResult = {
  property: { label: '부산 금정구 원룸', periodStart: '2026.12.01', periodEnd: '2028.11.30' },
  money: { deposit: 1000, monthlyRent: 50, maintenanceFee: 7 },
  warnings: [
    {
      id: 'restoration',
      title: '퇴실 시 도배·장판 비용 임차인 부담',
      description:
        '통상적인 사용으로 생긴 마모까지 임차인이 부담하게 되어 있어요. 원상복구 범위를 좁혀달라고 요청할 수 있어요.',
      source: {
        location: '특약 3항',
        quote: '임차인은 퇴실 시 도배 및 장판 교체 비용 일체를 부담한다.',
      },
    },
    {
      id: 'maintenance-items',
      title: '관리비 포함 항목이 적혀 있지 않음',
      description: '7만원에 수도·인터넷이 포함되는지 계약서에 적혀 있지 않아요.',
      source: { location: '제5조', quote: '관리비는 월 7만원으로 한다.' },
    },
  ],
  cautions: [
    {
      id: 'pet',
      title: '반려동물 위반 시 즉시 계약 해지',
      description: '위반 시 해지 조건이 넓게 적혀 있어요.',
      source: {
        location: '특약 5항',
        quote: '임차인이 반려동물을 사육할 경우 임대인은 즉시 계약을 해지할 수 있다.',
      },
    },
  ],
  safeCount: 5,
  totalCount: 10,
}

/** 1000 → "1,000만원", 15000 → "1억 5,000만원" */
export function formatManwon(v: number): string {
  const eok = Math.floor(v / 10000)
  const man = v % 10000
  const parts = [eok ? `${eok}억` : '', man ? `${man.toLocaleString('ko-KR')}만원` : '']
  const s = parts.filter(Boolean).join(' ')
  return man ? s : `${s}원`
}
