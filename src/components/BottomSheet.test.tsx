import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('is a labelled modal dialog that closes with Escape and returns focus', async () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <>
        <button type="button">열기</button>
        <BottomSheet open={false} title="약관" onClose={onClose}>
          본문
        </BottomSheet>
      </>,
    )
    const opener = screen.getByRole('button', { name: '열기' })
    opener.focus()
    rerender(
      <>
        <button type="button">열기</button>
        <BottomSheet open title="약관" onClose={onClose}>
          본문
        </BottomSheet>
      </>,
    )
    const dialog = screen.getByRole('dialog', { name: '약관' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
    rerender(
      <>
        <button type="button">열기</button>
        <BottomSheet open={false} title="약관" onClose={onClose}>
          본문
        </BottomSheet>
      </>,
    )
    expect(opener).toHaveFocus()
  })
})
