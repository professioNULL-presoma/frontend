import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadScreen } from './UploadScreen'

const pdf = () => new File(['x'], 'contract.pdf', { type: 'application/pdf' })

describe('UploadScreen', () => {
  it('enables 분석 시작하기 only with a page and all required consents', async () => {
    const onSubmit = vi.fn()
    render(<UploadScreen onSubmit={onSubmit} />)
    const cta = screen.getByRole('button', { name: '분석 시작하기' })
    expect(cta).toBeDisabled()
    expect(screen.getByText('필수 항목에 모두 동의하면 버튼이 켜져요')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox', { name: '모두 동의하기' }))
    expect(screen.getByRole('checkbox', { name: /개인정보 수집·이용 동의/ })).toBeChecked()
    expect(cta).toBeDisabled()
    expect(screen.getByText('계약서를 한 장 이상 올려주세요')).toBeInTheDocument()

    const file = pdf()
    await userEvent.upload(screen.getByTestId('file-input'), file)
    expect(screen.getByText('1장')).toBeInTheDocument()
    expect(cta).toBeEnabled()

    await userEvent.click(cta)
    expect(onSubmit).toHaveBeenCalledWith([file])
  })

  it('removes an uploaded page', async () => {
    render(<UploadScreen onSubmit={() => {}} />)
    await userEvent.upload(screen.getByTestId('file-input'), [pdf(), pdf()])
    expect(screen.getByText('2장')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '1쪽 삭제' }))
    expect(screen.getByText('1장')).toBeInTheDocument()
  })

  it('unchecks 모두 동의하기 when one item is unchecked', async () => {
    render(<UploadScreen onSubmit={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox', { name: '모두 동의하기' }))
    await userEvent.click(screen.getByRole('checkbox', { name: /계약서 이미지 처리 동의/ }))
    expect(screen.getByRole('checkbox', { name: '모두 동의하기' })).not.toBeChecked()
  })
})
