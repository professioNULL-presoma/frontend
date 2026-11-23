import { formatManwon } from './analysisResult'

describe('formatManwon', () => {
  it('formats 만원 amounts the toss.md way', () => {
    expect(formatManwon(50)).toBe('50만원')
    expect(formatManwon(1000)).toBe('1,000만원')
    expect(formatManwon(15000)).toBe('1억 5,000만원')
    expect(formatManwon(20000)).toBe('2억원')
  })
})
