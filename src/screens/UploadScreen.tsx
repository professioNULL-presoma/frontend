import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { BottomCTA } from '../components/BottomCTA'
import { Checkbox } from '../components/Checkbox'
import { Icon } from '../components/Icon'
import { TermsSheet, type TermsType } from '../components/TermsSheet'
import { TopBar } from '../components/TopBar'
import './UploadScreen.css'

type Page = { id: string; file: File; previewUrl: string | null }

const consentItems = [
  {
    key: 'privacy',
    title: '개인정보 수집·이용 동의 (필수)',
    sub: '이름·연락처·주소는 암호화해 저장해요',
  },
  {
    key: 'image',
    title: '계약서 이미지 처리 동의 (필수)',
    sub: '주민등록번호는 저장하지 않고, 원본 사진은 분석 후 삭제해요',
  },
] as const
type ConsentKey = (typeof consentItems)[number]['key']

// 동의 항목 → 동의 문서 종류. uploads 테이블은 동의 문서를 하나만 받아서 백엔드와 정리가 필요하다.
const termsOf: Record<ConsentKey, TermsType> = {
  privacy: 'SIGNUP_PRIVACY',
  image: 'CONTRACT_PROCESSING',
}

const tips = [
  '평평한 곳에 놓고 위에서 찍어요',
  '그림자·빛 반사 없이 찍어요',
  '특약 페이지까지 한 장씩 찍어요',
]

type Props = {
  onBack?: () => void
  /** 실패하면 Error 를 던진다. message 가 화면에 그대로 보인다. */
  onSubmit: (files: File[]) => Promise<void> | void
}

let seq = 0

export function UploadScreen({ onBack, onSubmit }: Props) {
  const [pages, setPages] = useState<Page[]>([])
  const [consent, setConsent] = useState<Record<ConsentKey, boolean>>({
    privacy: false,
    image: false,
  })
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 미리보기 URL은 이벤트에서만 만들고 지우며, 화면을 떠날 때 남은 것을 정리한다
  const previewUrls = useRef(new Set<string>())
  useEffect(() => {
    const urls = previewUrls.current
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const addFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files ?? []).map((file) => {
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      if (previewUrl) previewUrls.current.add(previewUrl)
      return { id: `p${++seq}`, file, previewUrl }
    })
    e.target.value = ''
    setPages((prev) => [...prev, ...added])
  }
  const removePage = (id: string) => {
    const target = pages.find((p) => p.id === id)
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
      previewUrls.current.delete(target.previewUrl)
    }
    setPages((prev) => prev.filter((p) => p.id !== id))
  }

  const allAgreed = consentItems.every((c) => consent[c.key])
  const [termsKey, setTermsKey] = useState<ConsentKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const ready = allAgreed && pages.length > 0

  const submit = async () => {
    if (!ready || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(pages.map((p) => p.file))
    } catch (e) {
      setSubmitError(
        e instanceof Error && e.message
          ? e.message
          : '업로드하지 못했어요. 잠시 후 다시 시도해 주세요.',
      )
      setSubmitting(false)
    }
  }
  const info = !allAgreed
    ? '필수 항목에 모두 동의하면 버튼이 켜져요'
    : pages.length === 0
      ? '계약서를 한 장 이상 올려주세요'
      : null

  return (
    <div className="upload">
      <TopBar title="계약서 등록" onBack={onBack} />

      <div className="upload__body">
        <div className="upload__headline">
          <h2 className="t-h3">계약서를 찍어주세요</h2>
          <p className="t-body-2 upload__secondary">
            모든 페이지를 올리면 특약까지 빠짐없이 읽어요.
          </p>
        </div>

        <section className="upload__tips" aria-labelledby="tips-title">
          <h3 id="tips-title" className="t-label-m">
            잘 찍는 법
          </h3>
          <ul>
            {tips.map((t) => (
              <li key={t} className="t-body-2">
                <Icon name="check" size={20} strokeWidth={2} />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <div className="upload__pickers">
          <button
            type="button"
            className="upload__picker"
            onClick={() => cameraRef.current?.click()}
          >
            <Icon name="camera" size={28} />
            <span className="t-label-m">카메라로 찍기</span>
          </button>
          <button type="button" className="upload__picker" onClick={() => fileRef.current?.click()}>
            <Icon name="file" size={28} />
            <span className="t-label-m">사진·PDF 선택</span>
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={addFiles}
            data-testid="camera-input"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            hidden
            onChange={addFiles}
            data-testid="file-input"
          />
        </div>

        {pages.length > 0 && (
          <section className="upload__pages" aria-labelledby="pages-title">
            <div className="upload__pages-head">
              <h3 id="pages-title" className="t-title-2">
                올린 페이지
              </h3>
              <span className="t-label-m upload__count tabular">{pages.length}장</span>
            </div>
            <ol className="upload__thumbs">
              {pages.map((p, i) => (
                <li key={p.id} className="upload__thumb">
                  {p.previewUrl ? (
                    <img src={p.previewUrl} alt={`${i + 1}쪽`} />
                  ) : (
                    <span className="upload__thumb-file">
                      <Icon name="file" size={24} />
                      <span className="t-caption">{i + 1}쪽 · PDF</span>
                    </span>
                  )}
                  <button
                    type="button"
                    className="upload__remove"
                    aria-label={`${i + 1}쪽 삭제`}
                    onClick={() => removePage(p.id)}
                  >
                    <Icon name="x" size={14} strokeWidth={2} />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="upload__add"
                  onClick={() => fileRef.current?.click()}
                >
                  <Icon name="plus" size={24} strokeWidth={2} />
                  <span className="t-caption">추가</span>
                </button>
              </li>
            </ol>
          </section>
        )}

        <fieldset className="upload__consent">
          <legend className="sr-only">개인정보 동의</legend>
          <label className="upload__consent-row upload__consent-all">
            <Checkbox
              checked={allAgreed}
              onChange={(e) => setConsent({ privacy: e.target.checked, image: e.target.checked })}
            />
            <span className="t-title-2">모두 동의하기</span>
          </label>
          <hr />
          {consentItems.map((c) => (
            <div key={c.key} className="upload__consent-row">
              <label className="upload__consent-label">
                <Checkbox
                  checked={consent[c.key]}
                  onChange={(e) => setConsent((v) => ({ ...v, [c.key]: e.target.checked }))}
                />
                <span className="upload__consent-text">
                  <span className="t-body-2">{c.title}</span>
                  <span className="t-body-3 upload__muted">{c.sub}</span>
                </span>
              </label>
              <button
                type="button"
                className="upload__terms"
                aria-label={`${c.title} 내용 보기`}
                onClick={() => setTermsKey(c.key)}
              >
                <Icon name="chevronRight" size={20} strokeWidth={2} />
              </button>
            </div>
          ))}
        </fieldset>
      </div>

      {submitError && (
        <p className="upload__error t-body-2" role="alert">
          <Icon name="warn" size={18} strokeWidth={2} />
          {submitError}
        </p>
      )}
      <BottomCTA info={info} disabled={!ready || submitting} busy={submitting} onClick={submit}>
        {submitting ? '올리는 중…' : '분석 시작하기'}
      </BottomCTA>
      <TermsSheet
        type={termsKey ? termsOf[termsKey] : null}
        onClose={() => setTermsKey(null)}
        onAgree={() => {
          if (termsKey) setConsent((v) => ({ ...v, [termsKey]: true }))
          setTermsKey(null)
        }}
      />
    </div>
  )
}
