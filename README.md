# 모두의 매뉴얼 — Next.js

AI와 함께 내용에 맞는 업무 매뉴얼을 만드는 도구. 정적 HTML/CSS/JS 버전(`../manual_1`)을 `plan.md`에 따라 Next.js 15로 옮겼다.
디자인 판단의 기준은 `DESIGN-figma.md`.

## 시작하기

```bash
npm install
cp .env.example .env.local     # 값 채우기 (아래 표)
npx prisma migrate deploy      # 또는 개발 중 스키마를 고칠 때: npm run db:migrate
npm run dev
```

| 변수 | 필수 | 설명 |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | ✓ | Postgres. Neon·Supabase는 풀링 URL / 직결 URL |
| `AUTH_SECRET` | ✓ | `npx auth secret` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ✓ | Google OAuth. 리디렉션 URI: `<도메인>/api/auth/callback/google` |
| `ANTHROPIC_API_KEY` | ✓ | 서버에서만 읽는다. 없으면 AI 버튼이 ‘사용할 수 없음’으로 바뀐다 |
| `ANTHROPIC_MODEL` | | 기본 `claude-opus-5`. 비용을 낮추려면 `claude-sonnet-5` |
| `RESEND_API_KEY` / `MAIL_FROM` | | 없으면 문의는 저장만 하고, 완료 화면의 mailto 폴백으로 전달한다 |
| `INQUIRY_TO` | | 문의 수신 주소 |
| `ADMIN_EMAILS` | | 쉼표 구분. 이 주소로 로그인하면 `/admin/inquiries` 열람 가능 |
| `SITE_URL` | | 메타데이터·sitemap 의 절대 주소 |

## 스크립트

- `npm test` — 마크다운 렌더러·내보내기가 **원본 app.js 출력과 한 글자까지 같은지** 비교한다.
  스냅샷은 `node scripts/snapshot-original-markdown.mjs ../manual_1/app.js` 로 다시 만든다.
- `npm run typecheck`, `npm run lint`, `npm run build`

## 구조

```
app/(site)/…          마케팅 6페이지, 도입 문의, 로그인, 관리자 문의함 (내비·푸터 있음)
app/editor/…          작업 화면 (전체 화면). /editor 는 가장 최근 문서로 이동
app/api/manuals       문서 CRUD — 모든 쿼리를 userId 로 한정
app/api/ai/*          outline · section · refine · review (maxDuration 300)
app/api/inquiries     문의 제출(허니팟→저장→메일) / 관리자 목록
lib/markdown.ts       renderMarkdown() 이식본
lib/prompts.ts        프롬프트 원문 (FORMAT_RULES 포함) — 문구 수정 금지
lib/export.ts         toMarkdown() toHTML() + 브라우저 다운로드
styles/               tokens · typography · site · editor (원본 CSS 를 줄 단위로 옮김)
```

## AI 호출

- 모델 `claude-opus-5`, `thinking: adaptive`. 검수는 `effort: high`.
- 목차·검수는 구조화 출력(Zod 스키마), 섹션·다듬기는 `text/plain` 스트리밍.
  스트림이 끝난 뒤 문제가 있으면 본문 뒤에 `\u0000<오류코드>` 를 붙인다 (`lib/ai-errors.ts`).
- 섹션 프롬프트의 앞부분(브리프·전체 목차)에 prompt caching — ‘전체 초안’에서 섹션마다 반복되는 입력.
- 안전 분류기 거절에 대비해 `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`)를 켜 두었다.
- 중단 버튼 → `AbortController` → 요청 `signal` → SDK 요청 취소 (과금 중단).
- 플랜별 월 호출 상한: `lib/plans.ts` (무료 60 · 팀 1,500 · 엔터프라이즈 무제한). 상한은 `AiUsage` 테이블에 기록.

## 배포 (Vercel)

- AI 라우트는 `maxDuration = 300` — **Pro 플랜 이상**이 필요하다 (plan §7).
- 빌드 명령은 기본값(`npm run build`)이 `prisma generate` 를 포함한다. 마이그레이션은 배포 전 `npm run db:deploy`.
- Resend에서 발신 도메인을 인증한 뒤 `MAIL_FROM` 을 그 도메인 주소로.
