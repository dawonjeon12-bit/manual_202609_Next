# 모두의 매뉴얼 — Next.js

AI와 함께 내용에 맞는 업무 매뉴얼을 만드는 도구. 정적 HTML/CSS/JS 버전(`../manual_1`)을 `plan.md`에 따라 Next.js로 옮겼다. 현재 **Next.js 16** (Turbopack, React 19.2), Node.js 20.9 이상.
디자인 판단의 기준은 `DESIGN-figma.md`.

## 시작하기

```bash
npm install
cp .env.example .env.local     # 값 채우기 (아래 표)
npx prisma migrate deploy      # 도입 문의를 DB에 저장할 때만 (DATABASE_URL 설정 후)
npm run dev
```

| 변수 | 필수 | 설명 |
|---|---|---|
| `RESEND_API_KEY` | | 도입 문의를 `dawonjeon12@gmail.com` 으로 발송. 없으면 완료 화면의 mailto 폴백으로 전달한다 |
| `ANTHROPIC_API_KEY` | | 편집기 AI 기능. 없으면 AI 버튼이 ‘사용할 수 없음’으로 바뀐다. **로그인이 없어 사용자별 상한이 없으니** Anthropic 콘솔에서 월 비용 한도를 걸어 둘 것 |
| `ANTHROPIC_MODEL` | | 기본 `claude-opus-5`. 비용을 낮추려면 `claude-sonnet-5` |
| `DATABASE_URL` / `DIRECT_URL` | | 도입 문의 저장용 Postgres. 없으면 저장을 건너뛰고 메일만 보낸다 |
| `SITE_URL` | | 메타데이터·sitemap 의 절대 주소 |

## 스크립트

- `npm test` — 마크다운 렌더러·내보내기가 **원본 app.js 출력과 한 글자까지 같은지** 비교한다.
  스냅샷은 `node scripts/snapshot-original-markdown.mjs ../manual_1/app.js` 로 다시 만든다.
- `npm run typecheck`, `npm run lint` (ESLint CLI — Next 16 에서 `next lint` 는 제거됨), `npm run build`
- `npm run build:local` — 로컬 빌드용 (Webpack). 이 폴더 경로에 한글(`ASC빌더트랙`)이 있으면
  Turbopack 빌드가 `Cannot find module for page` 로 실패한다. `next dev` 와 Vercel 빌드(영문 경로)는 영향 없음.
  폴더를 영문 경로로 옮기면 `npm run build` 를 그대로 써도 된다.

## 구조

```
src/app/(site)/…          마케팅 6페이지, 도입 문의, 개인정보처리방침·약관 (내비·푸터 있음)
src/app/editor/           작업 화면 (전체 화면). 로그인 없이 열리고 문서함은 브라우저 localStorage 에 저장 (src/lib/local-store.ts)
src/app/api/ai/*          outline · section · refine · review (maxDuration 300)
src/app/api/inquiries     문의 제출(허니팟→저장→메일)
src/lib/markdown.ts       renderMarkdown() 이식본
src/lib/prompts.ts        프롬프트 원문 (FORMAT_RULES 포함) — 문구 수정 금지
src/lib/export.ts         toMarkdown() toHTML() + 브라우저 다운로드
src/styles/               tokens · typography · site · editor (원본 CSS 를 줄 단위로 옮김)
prisma/ tests/ scripts/  DB 스키마·마이그레이션, 원본 대조 테스트, 스냅샷 생성 스크립트 (src 밖)
```

## AI 호출

- 모델 `claude-opus-5`, `thinking: adaptive`. 검수는 `effort: high`.
- 목차·검수는 구조화 출력(Zod 스키마), 섹션·다듬기는 `text/plain` 스트리밍.
  스트림이 끝난 뒤 문제가 있으면 본문 뒤에 `\u0000<오류코드>` 를 붙인다 (`src/lib/ai-errors.ts`).
- 섹션 프롬프트의 앞부분(브리프·전체 목차)에 prompt caching — ‘전체 초안’에서 섹션마다 반복되는 입력.
- 안전 분류기 거절에 대비해 `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`)를 켜 두었다.
- 중단 버튼 → `AbortController` → 요청 `signal` → SDK 요청 취소 (과금 중단).
- 로그인이 없으므로 사용자별 호출 상한은 없다. Google 로그인·서버 문서함·관리자 문의함·플랜별 상한은 커밋 `31fee23` 에 남아 있다.

## 배포 (Vercel)

- AI 라우트는 `maxDuration = 300` — **Pro 플랜 이상**이 필요하다 (plan §7).
- 빌드 명령은 기본값(`npm run build`)이 `prisma generate` 를 포함한다. 마이그레이션은 배포 전 `npm run db:deploy`.
- 메일 발신자는 Resend 기본 주소 `onboarding@resend.dev` — Resend 계정 소유자 메일로만 보낼 수 있다.
  수신 주소(`dawonjeon12@gmail.com`)가 Resend 가입 메일과 같아야 하며, 도메인을 인증하면 `src/lib/mail.ts` 의 `FROM` 을 바꾼다.
