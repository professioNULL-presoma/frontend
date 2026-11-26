/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** 'false' 로 두면 실제 API를 부른다. 백엔드 API가 생기기 전까지 기본은 목 응답. */
  readonly VITE_USE_MOCK_API?: string
}
