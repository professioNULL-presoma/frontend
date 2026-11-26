import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TermsSheet } from './TermsSheet'

describe('TermsSheet', () => {
  it('loads the document and agrees from the sheet', async () => {
    const onAgree = vi.fn()
    render(<TermsSheet type="SIGNUP_PRIVACY" onClose={() => {}} onAgree={onAgree} />)
    expect(
      await screen.findByRole('dialog', { name: '개인정보 수집·이용 동의' }),
    ).toHaveTextContent('수집 항목')
    await userEvent.click(screen.getByRole('button', { name: '동의하기' }))
    expect(onAgree).toHaveBeenCalledWith(
      expect.objectContaining({ documentType: 'SIGNUP_PRIVACY' }),
    )
  })

  it('renders nothing when closed', () => {
    render(<TermsSheet type={null} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
