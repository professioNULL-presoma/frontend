import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadScreen } from './UploadScreen'

/** 모두 동의하기 → 약관 시트가 차례로 열리고 각각 확인 */
const agreeAll = async () => {
  await userEvent.click(screen.getByRole('checkbox', { name: '모두 동의하기' }))
  await userEvent.click(await screen.findByRole('button', { name: '확인' }))
  await screen.findByRole('dialog', { name: '계약서 이미지 처리 동의' })
  await userEvent.click(await screen.findByRole('button', { name: '확인' }))
}

const pdf = () => new File(['x'], 'contract.pdf', { type: 'application/pdf' })

describe('UploadScreen', () => {
  it('enables 분석 시작하기 only with a page and all required consents', async () => {
    const onSubmit = vi.fn()
    render(<UploadScreen onSubmit={onSubmit} />)
    const cta = screen.getByRole('button', { name: '분석 시작하기' })
    expect(cta).toBeDisabled()
    expect(screen.getByText('필수 항목에 모두 동의하면 버튼이 켜져요')).toBeInTheDocument()

    await agreeAll()
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
    await agreeAll()
    expect(screen.getByRole('checkbox', { name: '모두 동의하기' })).toBeChecked()
    await userEvent.click(screen.getByRole('checkbox', { name: /계약서 이미지 처리 동의/ }))
    expect(screen.getByRole('checkbox', { name: /계약서 이미지 처리 동의/ })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: '모두 동의하기' })).not.toBeChecked()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('checks one item only after 확인, and 닫기 leaves it unchecked', async () => {
    render(<UploadScreen onSubmit={() => {}} />)
    const box = screen.getByRole('checkbox', { name: /개인정보 수집·이용 동의/ })
    await userEvent.click(box)
    await userEvent.click(await screen.findByRole('button', { name: '닫기' }))
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    await userEvent.click(await screen.findByRole('button', { name: '확인' }))
    expect(box).toBeChecked()
    expect(screen.getByRole('checkbox', { name: '모두 동의하기' })).not.toBeChecked()
  })

  it('shows uploading state and the error message when the upload fails', async () => {
    let reject: (e: Error) => void = () => {}
    const onSubmit = vi.fn(() => new Promise<void>((_, r) => (reject = r)))
    render(<UploadScreen onSubmit={onSubmit} />)
    await agreeAll()
    await userEvent.upload(screen.getByTestId('file-input'), pdf())
    await userEvent.click(screen.getByRole('button', { name: '분석 시작하기' }))
    expect(screen.getByRole('button', { name: '올리는 중…' })).toBeDisabled()
    reject(new Error('파일이 너무 커요. 20MB 이하로 올려주세요.'))
    expect(await screen.findByRole('alert')).toHaveTextContent('파일이 너무 커요')
    expect(screen.getByRole('button', { name: '분석 시작하기' })).toBeEnabled()
  })
})
