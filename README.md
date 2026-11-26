# 집사 · 프론트엔드

원룸 계약서를 찍어 올리면 내 부담이 되는 조건과 집주인에게 물어볼 질문을 정리해 주는 서비스 **집사**의 웹 프론트엔드입니다.

> 현재 단계: 계약서 등록 · 분석 결과 화면 UI 구현. 분석 API가 없어 결과는 **목데이터**로 표시합니다.

## 기술 스택

| 구분           | 사용                                      |
| -------------- | ----------------------------------------- |
| UI             | React 19, TypeScript (strict)             |
| 빌드·개발 서버 | Vite                                      |
| 테스트         | Vitest, Testing Library                   |
| 품질           | ESLint (jsx-a11y 포함), Prettier          |
| 디자인 시스템  | [`docs/toss.md`](docs/toss.md) (TDS 기반) |

## 시작하기

Node.js 22 이상이 필요합니다.

```sh
npm install                    # scripts/setup.sh 가 자동 실행돼 git 훅을 켭니다
cp .env.example .env.local     # VITE_API_TARGET 에 백엔드 주소 입력
npm run dev                    # http://localhost:5173
```

- `http://localhost:5173/#/` : 계약서 등록
- `http://localhost:5173/#/result` : 분석 결과

## 명령어

| 명령             | 설명                                                       |
| ---------------- | ---------------------------------------------------------- |
| `npm run dev`    | 개발 서버                                                  |
| `npm run build`  | 타입 검사 후 프로덕션 빌드 (`dist/`)                       |
| `npm run test`   | 테스트                                                     |
| `npm run check`  | 포맷 · 린트 · 타입 · 디자인 규칙 · 토큰 · 테스트 전체 검사 |
| `npm run tokens` | `docs/toss.md` 에서 `src/styles/tokens.css` 재생성         |

`npm run check` 는 push 전 훅과 CI에서도 실행됩니다. 통과해야 올릴 수 있습니다.

## 폴더 구조

```
docs/
  toss.md              디자인 시스템 문서 (색·간격·라운드 토큰의 원본)
scripts/               토큰 생성, 디자인 규칙 검사, git 훅 설정
src/
  api/                 백엔드 API 호출 (client.ts, health.ts)
  components/          공통 컴포넌트 — Name.tsx / Name.css / Name.test.tsx
  data/                화면 데이터 타입과 목데이터
  screens/             화면 단위 컴포넌트 (UploadScreen, ResultScreen)
  styles/              tokens.css(자동 생성) · typography.css · global.css
  App.tsx              화면 전환 (임시 해시 라우팅)
.githooks/  .github/   커밋·push 훅, CI
.kiro/steering/        코딩 에이전트용 작업 규칙
```

## 백엔드 연결

백엔드(Spring Boot)는 [`backend`](https://github.com/professioNULL-presoma/backend) 레포에 있습니다.

- 백엔드에 CORS 설정이 없어서 개발 중에는 Vite 프록시를 씁니다. 화면에서 `/api/*` 로 요청하면 `VITE_API_TARGET` 서버의 `/*` 로 전달됩니다. (예: `/api/health` → `/health`)
- 서버 주소는 `.env.local` 에만 둡니다. 이 파일은 커밋되지 않습니다.
- 개발 모드에서는 화면 구석에 서버 연결 상태가 표시됩니다.
- 현재 사용 가능한 API는 `GET /health` 하나입니다.

## 디자인 규칙

- 색·간격·라운드·그림자는 `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)` 토큰만 씁니다. 코드에 hex, `rgb()`, `oklch()` 를 직접 쓰면 `npm run check:design` 에서 실패합니다.
- `src/styles/tokens.css` 는 직접 고치지 않습니다. `docs/toss.md` 의 frontmatter를 고치고 `npm run tokens` 를 실행합니다.
- 글자 크기는 `typography.css` 의 `.t-h3`, `.t-body-2` 같은 클래스를 씁니다. 금액에는 `.tabular` 를 붙입니다.
- 문구는 해요체, 금액은 `1,000만원` 형식으로 씁니다.
- 디자인 시안: 피그마 `집사 - 와이어프레임` 파일의 `화면 · toss.md` 섹션

## 브랜치·PR·커밋 규칙

팀 공통 규칙은 [harness/CONVENTION.md](https://github.com/professioNULL-presoma/harness/blob/dev/CONVENTION.md)를 따릅니다. 요약:

```
기능 브랜치 ──(PR, Squash)──▶ dev ──(배포 PR, Merge commit)──▶ main
```

- `dev`(기본 브랜치)와 `main`은 직접 push할 수 없습니다. PR과 승인 1명이 필요합니다.
- 이슈를 먼저 만들고, 브랜치는 `dev`에서 `<타입>/<이슈번호>-<설명>`으로 만듭니다. 예: `feat/3-history-screen`
- PR base는 `dev`, 본문에 `Closes #번호`. 리뷰어는 채민(1순위), 예준(2순위)입니다.
- PR 제목이 `dev`에 남는 커밋 메시지가 됩니다: `<타입>: <무엇을 했는지> (#이슈번호)`
  - 타입: `feat` `fix` `refactor` `test` `docs` `infra` `chore` `style`

```sh
git switch dev && git pull
git switch -c feat/3-history-screen
git push -u origin feat/3-history-screen   # GitHub에서 base: dev 로 PR
```

### 이 레포의 git 훅

- 각자 자기 git 계정(`user.name`, `user.email`)으로 커밋합니다.
- AI 도구를 작성자나 공동 작성자로 적지 않습니다. `commit-msg` 훅이 AI `Co-authored-by`와 "Generated with" 줄을 자동으로 지우고, push 전 훅과 CI가 한 번 더 확인합니다. 사람 공동 작성자는 그대로 둡니다.
- 포맷팅과 push 전 검사(`npm run check`)는 `.githooks/`가 처리합니다. 훅은 `npm install` 때 자동으로 켜집니다.

## 남은 작업

- [ ] ERD·분석 API 확정 후 실제 데이터 연결 (`src/data/analysisResult.ts` 타입 기준)
- [ ] 질문 목록 · 전체 항목 · 약관 · 분석 중 · 오류 화면
- [ ] 라우터 도입, Pretendard 웹폰트 적용
- [ ] 배포 (백엔드 CORS·HTTPS 필요)
