# 모두의 매뉴얼 — Next.js 이관 계획

> **이 문서를 읽는 사람**: 이 마이그레이션을 실행할 개발자 또는 코딩 에이전트.
> 현재 코드를 몰라도 이 문서만으로 처음부터 끝까지 진행할 수 있도록 작성했다.

- **작성일**: 2026-09-27
- **원본 저장소**: `github.com/dawonjeon12-bit/manual_202609` (정적 HTML/CSS/JS)
- **원칙**: 기능 누락 없는 **전수 이관**. 아래 §3 대조표의 모든 행이 이관 대상이며, 하나라도 빠지면 완료가 아니다.

---

## 1. 지금 무엇을 옮기는가

현재 프로젝트는 빌드 도구 없는 정적 사이트다. 총 3,587줄.

| 파일 | 줄 | 역할 |
|---|---:|---|
| `app.js` | 1,103 | 매뉴얼 편집기 전체 (문서 CRUD, AI 호출, 마크다운 렌더러, 내보내기) |
| `site.js` | 1,087 | 해시 라우터, 마케팅 6페이지, 도입 문의 폼, 문의함 |
| `styles.css` | 581 | 편집기 스타일 (전부 `.mx` 범위로 격리됨) |
| `site.css` | 527 | 디자인 시스템 토큰 + 마케팅 사이트 |
| `shell.js` | 256 | 사이트 골격 마크업 (내비·푸터·편집기 컨테이너) |
| `index.html` / `standalone.html` | 33 | 진입점 2종 (게시용 / 로컬용) |

디자인 근거는 `DESIGN-figma.md`다. 이 파일은 그대로 저장소에 남기고 새 프로젝트에서도 디자인 판단의 기준으로 삼는다.

---

## 2. 가장 큰 쟁점 — Artifact 런타임 의존성

현재 AI·저장·다운로드 기능은 **claude.ai Artifact 뷰어 안에서만 동작하는 런타임 API**에 의존한다. Next.js에는 이것이 존재하지 않는다. **이관 작업의 절반은 이 세 가지를 실제 인프라로 바꾸는 일이다.**

| 현재 (`window.claude.use(...)`) | 호출 지점 | Next.js 대체 |
|---|---|---|
| `sample` — Claude 호출 | `app.js:289` | **Anthropic API** + 서버 Route Handler (키는 서버에만) |
| `db` — 문서·문의 저장 | `app.js:265`, `site.js:749`, `site.js:944` | **Postgres + Prisma** + 사용자 인증 |
| `downloads` — 파일 저장 | `app.js:297` | **브라우저 기본 다운로드** (`Blob` + `a[download]`) — 샌드박스가 없으므로 더 단순해진다 |

부수 효과로 해결되는 것들:
- 외부 네트워크 요청 차단이 사라진다 → 메일 API 직접 호출 가능 (기존 Phase 2 계획이 여기서 흡수됨)
- 공개 공유 제약이 사라진다 → 외부 고객이 도입 문의 폼에 접근 가능
- 문의 데이터 접근 제어가 가능해진다 → 관리자만 열람

---

## 3. 기능 전수 대조표

**이 표가 완료 기준이다.** 모든 행에 체크가 들어가야 이관이 끝난다.

### 3.1 마케팅 사이트

| # | 기능 | 현재 위치 | 이관 위치 | ☑ |
|---|---|---|---|---|
| 1 | 해시 라우팅 6페이지 | `site.js` `route()` | App Router 파일 라우팅 | ☑ |
| 2 | 상단 내비 + 활성 상태 | `shell.js`, `renderNav()` | `components/Nav.tsx` (`usePathname`) | ☑ |
| 3 | 모바일 햄버거 오버레이 | `site.js` `openNav()` | `Nav.tsx` 클라이언트 상태 | ☑ |
| 4 | 마키 스트립 (감속 대응) | `site.css` `@keyframes slide` | `components/Marquee.tsx` | ☑ |
| 5 | Home — 히어로 + 문서 목업 | `home()` | `app/page.tsx` | ☑ |
| 6 | Home — 차별점 3타일 | `home()` | 동일 | ☑ |
| 7 | Home — 라임/네이비/코랄 블록 | `home()` | 동일 | ☑ |
| 8 | Home — 템플릿 8종 그리드 | `home()` | 동일 | ☑ |
| 9 | Product — 6단계 | `product()` | `app/product/page.tsx` | ☑ |
| 10 | Product — 섹션 종류 8종 표 | `product()` | 동일 | ☑ |
| 11 | Product — 라일락/민트 블록 | `product()` | 동일 | ☑ |
| 12 | Tools — 워크스페이스 카드 | `tools()` | `app/tools/page.tsx` | ☑ |
| 13 | Tools — 도구 4종 + 내보내기 3종 | `tools()` | 동일 | ☑ |
| 14 | Customers — 팀 프로필 4종 | `customers()` | `app/customers/page.tsx` | ☑ |
| 15 | Customers — 핑크 블록(적합/부적합) | `customers()` | 동일 | ☑ |
| 16 | Customers — 도입 3단계 | `customers()` | 동일 | ☑ |
| 17 | Community — 프로모 배너 + 마젠타 CTA | `community()` | `app/community/page.tsx` | ☑ |
| 18 | Community — 공유 템플릿 콜라주 | `community()` | 동일 | ☑ |
| 19 | Community — 포럼/변경로그/밋업 | `community()` | 동일 | ☑ |
| 20 | Pricing — 월간/연간 토글 | `pricing()`, `billing` | `app/pricing/` + 클라이언트 컴포넌트 | ☑ |
| 21 | Pricing — 플랜 카드 3종 | `priceCards()` | 동일 | ☑ |
| 22 | Pricing — 비교표(체크 글리프) | `pricing()` | 동일 | ☑ |
| 23 | Pricing — 라임 FAQ 아코디언 | `pricing()` | 동일 (`<details>` 유지) | ☑ |
| 24 | 푸터 5열 | `shell.js` | `components/Footer.tsx` | ☑ |

### 3.2 도입 문의

| # | 기능 | 현재 위치 | 이관 위치 | ☑ |
|---|---|---|---|---|
| 25 | 폼 3그룹 11항목 | `contact()` | `app/contact/page.tsx` | ☑ |
| 26 | 플랜별 프리필 (`?plan=`) | `contact(params)` | `searchParams` | ☑ |
| 27 | 단일/다중 선택 알약 | `choices()` | `components/ChoiceGroup.tsx` | ☑ |
| 28 | 필수 7항목 검증 + 오류 표시 | `validate()`, `setError()` | React Hook Form + Zod | ☑ |
| 29 | 개인정보 수집·이용 동의 | `contact()` | 동일 (**법적 필수, 삭제 금지**) | ☑ |
| 30 | 허니팟 봇 차단 | `#f-hp` | 서버에서도 검사 | ☑ |
| 31 | 제출 → 저장 | `submitInquiry()` | `POST /api/inquiries` → DB | ☑ |
| 32 | **제출 → 메일 발송** | *(미구현)* | Route Handler에서 Resend 발송 | ☑ |
| 33 | 완료 화면 + 문의번호 | `doneView()` | `app/contact/done/` | ☑ |
| 34 | mailto 폴백 / 내용 복사 | `inquiryMailto()` | 유지 (메일 발송 실패 시 대비) | ☑ |
| 35 | 문의함 목록 | `inbox()` | `app/admin/inquiries/` (**인증 필요**) | ☑ |

### 3.3 매뉴얼 편집기

| # | 기능 | 현재 위치 | 이관 위치 | ☑ |
|---|---|---|---|---|
| 36 | 문서함 목록/생성/열기/삭제 | `renderRail()`, `newDoc()`, `deleteDoc()` | `app/editor/` + `/api/manuals` | ☑ |
| 37 | 자동 저장 (디바운스 900ms) | `touch()`, `persist()` | 동일 로직 + `PATCH /api/manuals/:id` | ☑ |
| 38 | Cmd+S 즉시 저장 | `bind()` keydown | 유지 | ☑ |
| 39 | 표제부 7필드 | `renderDocHead()` | `components/DocHead.tsx` | ☑ |
| 40 | 섹션 추가/삭제/순서/종류/제목/본문 | `sectionEl()` 외 | `components/SectionList.tsx` | ☑ |
| 41 | 편집/읽기 모드 토글 | `setMode()` | 클라이언트 상태 | ☑ |
| 42 | 마크다운 렌더러 | `renderMarkdown()` (76줄) | `lib/markdown.ts` — **그대로 이식** | ☑ |
| 43 | └ 표·체크리스트·번호절차·경고·Q&A·코드 | 동일 | 동일 | ☑ |
| 44 | **AI — 목차 설계 (JSON)** | `runOutline()` | `POST /api/ai/outline` | ☑ |
| 45 | **AI — 섹션 본문 (스트리밍)** | `writeSection()` | `POST /api/ai/section` | ☑ |
| 46 | **AI — 전체 초안 (순차)** | `runDraft()` | 클라이언트에서 45번 반복 | ☑ |
| 47 | **AI — 다듬기 8종 + 직접지시** | `runRefine()`, `REFINE` | `POST /api/ai/refine` | ☑ |
| 48 | └ 되돌리기 | `state.undo` | 유지 | ☑ |
| 49 | **AI — 검수 (JSON) + 섹션 점프** | `runReview()`, `renderFindings()` | `POST /api/ai/review` | ☑ |
| 50 | 진행 표시 + 중단 버튼 | `withAi()`, `AbortController` | `AbortController` + 스트림 취소 | ☑ |
| 51 | 오류 코드별 한글 메시지 | `ERR` 맵 | API 오류 → 동일 맵으로 변환 | ☑ |
| 52 | 지어내기 방지 프롬프트 규칙 | `FORMAT_RULES` | `lib/prompts.ts` — **문구 그대로** | ☑ |
| 53 | 내보내기 — Markdown | `toMarkdown()` | `lib/export.ts` | ☑ |
| 54 | 내보내기 — HTML (독립 문서) | `toHTML()` (92줄) | 동일 | ☑ |
| 55 | 내보내기 — 전문 복사 | `copyText()` | 유지 | ☑ |
| 56 | 예시 문서 시드 | `sampleDoc()` | 신규 가입 시 1건 생성 | ☑ |
| 57 | 반응형 드로어 (문서함/작업대) | `@media (max-width:1180/860)` | 유지 | ☑ |

### 3.4 디자인 시스템

| # | 기능 | 현재 위치 | 이관 위치 | ☑ |
|---|---|---|---|---|
| 58 | 색 토큰 (파스텔 7 + 흑백 + 헤어라인) | `site.css :root` | `styles/tokens.css` | ☑ |
| 59 | 모서리·간격 토큰 | 동일 | 동일 | ☑ |
| 60 | 타이포 12역할 | `site.css` | `styles/typography.css` | ☑ |
| 61 | 알약 버튼 4종 | `.btn-p/.btn-s/.btn-t/.btn-m` | `components/Button.tsx` | ☑ |
| 62 | 컬러 블록 8종 | `.block[data-bg]` | `components/Block.tsx` | ☑ |
| 63 | 편집기 조판 (`.mx` 전체) | `styles.css` | `styles/editor.css` — 범위 격리 불필요해짐 | ☑ |
| 64 | 섹션 종류별 색 매핑 | `--t-개요` 외 | 유지 | ☑ |

---

## 4. 목표 아키텍처

### 4.1 기술 선택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router) + TypeScript** | 요청 사항 |
| 스타일 | **CSS 변수 + CSS Modules** | 기존 토큰/조판을 손실 없이 옮기는 가장 짧은 경로. Tailwind로 갈아엎으면 디자인 회귀 위험만 커진다 |
| DB | **Postgres (Neon 또는 Supabase) + Prisma** | 관계형 구조(문서-섹션)에 맞고 Vercel과 궁합이 좋다 |
| 인증 | **Auth.js (NextAuth v5)** — Google OAuth | 문서 소유권 분리에 필요. 문의 폼은 비로그인 접근 |
| AI | **`@anthropic-ai/sdk`** — 서버 전용 | 키가 절대 클라이언트로 나가면 안 된다 |
| 메일 | **Resend** | Route Handler에서 발송, 도메인 인증 지원 |
| 배포 | **Vercel** | |

### 4.2 디렉터리

```
app/
  layout.tsx                    내비 + 푸터 + 폰트
  page.tsx                      Home
  product|tools|customers|community|pricing/page.tsx
  contact/
    page.tsx                    문의 폼
    done/page.tsx               완료 화면
  editor/
    page.tsx                    문서함 (목록)
    [id]/page.tsx               편집 화면
  admin/inquiries/page.tsx      문의함 (인증 필요)
  api/
    ai/outline|section|refine|review/route.ts
    manuals/route.ts            GET(목록) POST(생성)
    manuals/[id]/route.ts       GET PATCH DELETE
    inquiries/route.ts          POST(제출+메일) GET(관리자)
    auth/[...nextauth]/route.ts
components/                     Nav Footer Button Block ChoiceGroup
  editor/                       DocHead SectionList AiPanel Findings
lib/
  anthropic.ts                  클라이언트 + 공통 호출 래퍼
  prompts.ts                    FORMAT_RULES, 목차/섹션/다듬기/검수 프롬프트
  markdown.ts                   renderMarkdown() 이식
  export.ts                     toMarkdown() toHTML()
  db.ts                         Prisma 싱글턴
styles/
  tokens.css typography.css editor.css
prisma/schema.prisma
```

### 4.3 데이터 모델

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  manuals   Manual[]
  role      Role      @default(USER)   // 문의함 열람은 ADMIN만
}

model Manual {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title         String    @default("")
  kind          String    @default("업무 매뉴얼")
  code          String    @default("")
  rev           String    @default("1.0")
  effectiveDate String    @default("")
  owner         String    @default("")
  approver      String    @default("")
  brief         Json                     // topic, audience, purpose, tone, depth, raw
  sections      Section[]
  updatedAt     DateTime  @updatedAt
  @@index([userId, updatedAt])
}

model Section {
  id        String  @id @default(cuid())
  manualId  String
  manual    Manual  @relation(fields: [manualId], references: [id], onDelete: Cascade)
  order     Int
  type      String                       // 개요|절차|체크리스트|기준|주의|FAQ|용어|양식
  title     String
  body      String  @db.Text
  hint      String  @default("")
  @@index([manualId, order])
}

model Inquiry {
  id           String   @id                // INQ-260927-A1B2 형식 유지
  plan         String
  company      String
  name         String
  jobTitle     String   @default("")
  email        String
  phone        String   @default("")
  teamSize     String
  manualTypes  String[]
  currentTool  String   @default("")
  pain         String   @default("") @db.Text
  timeline     String
  needs        String[]
  note         String   @default("") @db.Text
  consent      Boolean
  source       String   @default("")
  status       String   @default("new")    // new|contacted|closed
  createdAt    DateTime @default(now())
  @@index([createdAt])
}
```

### 4.4 AI Route Handler 명세

네 엔드포인트 모두 **서버에서만** `ANTHROPIC_API_KEY`를 읽는다.

| 엔드포인트 | 입력 | 출력 | 모델 설정 |
|---|---|---|---|
| `POST /api/ai/outline` | `{brief, title}` | JSON 배열 `[{title,type,hint}]` | `claude-opus-5`, 구조화 출력 |
| `POST /api/ai/section` | `{manual, sectionId}` | `text/event-stream` | `claude-opus-5`, 스트리밍 |
| `POST /api/ai/refine` | `{manual, sectionId, action, note}` | `text/event-stream` | `claude-opus-5`, 스트리밍 |
| `POST /api/ai/review` | `{manual}` | JSON 배열 `[{severity,section,issue,fix}]` | `claude-opus-5`, `effort: "high"` |

**공통 규칙**
- 모델 ID는 `claude-opus-5` ($5 / $25 per 1M 토큰). 비용을 낮춰야 하면 `claude-sonnet-5` ($2 / $10)로 내리되, **품질 판단은 사용자 몫**이므로 임의로 바꾸지 않는다.
- 사고 설정은 `thinking: { type: "adaptive" }`. `budget_tokens`는 이 모델에서 **400 에러**다.
- 스트리밍은 `client.messages.stream({ max_tokens: 64000, ... })` → `ReadableStream`으로 변환해 반환.
- `export const runtime = 'nodejs'`, **`export const maxDuration = 300`**. 기본 타임아웃으로는 긴 생성이 잘린다 (§7 리스크 참조).
- 프롬프트 앞부분(`FORMAT_RULES` + 브리프)은 **prompt caching** 대상으로 잡는다. 섹션 8개를 연속 생성할 때 입력 토큰이 그만큼 반복된다.
- `AbortSignal`을 요청에 연결해 클라이언트 `중단` 버튼이 실제로 과금을 멈추게 한다.

스트리밍 Route Handler 골격:

```ts
// app/api/ai/section/route.ts
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request) {
  const { manual, sectionId } = await req.json();
  const stream = anthropic.messages.stream({
    model: 'claude-opus-5',
    max_tokens: 64000,
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: sectionPrompt(manual, sectionId) }],
  }, { signal: req.signal });

  return new Response(
    new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          for await (const ev of stream) {
            if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
              controller.enqueue(enc.encode(ev.delta.text));
            }
          }
        } catch (e) { controller.error(e); }
        finally { controller.close(); }
      },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
```

---

## 5. 단계별 작업

각 단계 끝에 커밋한다. 앞 단계가 끝나야 다음 단계가 의미 있다.

### Phase 0 — 셋업 (0.5일)
- [ ] `create-next-app` (TypeScript, App Router, ESLint)
- [ ] Prisma + Postgres 연결, `prisma migrate dev`
- [ ] `.env.local`: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `RESEND_API_KEY`, `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`
- [ ] `DESIGN-figma.md`를 새 저장소로 복사

### Phase 1 — 디자인 시스템 (1일) → 대조표 58~62, 64
- [ ] `styles/tokens.css` — `site.css :root` 전체 이식
- [ ] `next/font`로 Inter / Noto Sans KR / JetBrains Mono 로드
- [ ] `Button` `Block` `Tile` `Card` 컴포넌트
- [ ] 스토리 페이지 하나에 전 컴포넌트를 깔아 원본과 눈으로 대조

### Phase 2 — 마케팅 6페이지 (2일) → 대조표 1~24
- [ ] `layout.tsx` + `Nav` + `Footer` + `Marquee`
- [ ] 6개 페이지. 콘텐츠 문자열은 `site.js`에서 **그대로** 옮긴다 (다시 쓰지 말 것)
- [ ] Pricing 토글·비교표·FAQ
- [ ] 메타데이터(`generateMetadata`) — 정적 사이트엔 없던 SEO 개선

### Phase 3 — 도입 문의 + 메일 (1일) → 대조표 25~35
- [ ] 폼 + Zod 스키마 + React Hook Form
- [ ] `POST /api/inquiries` — 허니팟 검사 → DB 저장 → Resend 발송
- [ ] 발송 실패해도 저장은 남기고 완료 화면에서 mailto 폴백 제공
- [ ] 자동 회신 메일 (문의자에게 접수 확인)
- [ ] `/admin/inquiries` — ADMIN만

### Phase 4 — 인증 + 문서 API (1일) → 대조표 36~38
- [ ] Auth.js Google 로그인
- [ ] `/api/manuals` CRUD, 모든 쿼리에 `userId` 스코프 **강제**
- [ ] 첫 로그인 시 예시 문서 시드

### Phase 5 — 편집기 UI (2일) → 대조표 39~43, 53~57
- [ ] `lib/markdown.ts` — `renderMarkdown()` 이식 후 **원본과 출력 diff 비교**
- [ ] 표제부 / 섹션 리스트 / 편집·읽기 토글
- [ ] `lib/export.ts` — Markdown·HTML·복사
- [ ] 반응형 드로어

### Phase 6 — AI 라우트 (2일) → 대조표 44~52
- [ ] `lib/prompts.ts` — 프롬프트 **문구 그대로** 이식 (`FORMAT_RULES` 포함)
- [ ] 네 라우트 구현 + 스트리밍 소비 훅 `useAiStream()`
- [ ] 중단 버튼 → `AbortController`
- [ ] 오류 코드 → 한글 메시지 매핑
- [ ] **사용량 제한** (플랜별 월 호출 수) — 정적 버전엔 없던 신규 요구

### Phase 7 — 마무리 (1일)
- [ ] 대조표 64행 전수 점검
- [ ] Vercel 배포 + 도메인 + Resend 도메인 인증
- [ ] 원본 사이트와 페이지별 스크린샷 대조
- [ ] `README.md` 갱신, 기존 저장소에 이관 안내 추가

**합계 약 10.5일** (1인 기준)

---

## 6. 신규로 생기는 것

정적 버전에 없어서 새로 설계해야 하는 항목. 이관 범위에 포함된다.

- **로그인** — 문서 소유권 분리에 필수
- **사용량 제한** — AI 비용이 이제 서비스 부담. 플랜별 상한 + 초과 안내
- **관리자 권한** — 문의함 접근 제어
- **에러 바운더리 / 로딩 상태** — SPA가 아니므로 라우트 전환 UX 필요
- **실제 메일 발송** — 기존 Phase 2 계획이 여기로 흡수

---

## 7. 리스크와 결정 필요 사항

| 리스크 | 영향 | 대응 |
|---|---|---|
| **Vercel 함수 타임아웃** | Opus 5는 긴 생성에 최대 2분. Hobby 플랜 상한으로는 섹션 생성이 잘린다 | `maxDuration = 300` + **Pro 플랜 필요**. 불가 시 Sonnet 5 + effort 하향 |
| **AI 비용이 서비스 부담으로 전환** | 기존엔 사용자 Claude 사용량이었다 | Phase 6의 사용량 제한을 선택이 아닌 필수로 취급 |
| **마크다운 렌더러 회귀** | 조판이 미묘하게 깨지면 발견이 늦다 | 원본 함수의 입출력 스냅샷 테스트를 먼저 작성 |
| **디자인 회귀** | 손으로 옮기며 토큰이 어긋난다 | 토큰은 복사만, 재작성 금지. Phase 1 대조 페이지로 확인 |
| **개인정보 보관** | 실제 문의 데이터 = 실제 개인정보 | 보유기간 1년 경과분 자동 파기 배치, 관리자 접근 로그 |

**시작 전 결정할 것**

1. **DB 호스팅** — Neon / Supabase / 기타?
2. **인증 제공자** — Google만? 이메일 매직링크도?
3. **요금 실제 운영 여부** — 결제(Stripe 등)까지 붙일지, 당분간 문의 폼으로 받을지
4. **도메인** — Resend 도메인 인증에 필요
5. **AI 모델** — `claude-opus-5` 유지 vs `claude-sonnet-5`로 비용 절감

---

## 8. 완료 기준

- [ ] §3 대조표 64개 행 전부 체크
- [ ] 원본과 6페이지 스크린샷 대조 통과 (데스크톱 + 모바일 400px)
- [ ] 로그인 → 문서 생성 → 목차 설계 → 초안 → 다듬기 → 검수 → 내보내기 전 흐름 수동 검증
- [ ] 도입 문의 제출 시 **실제 메일 수신 확인**
- [x] 다른 사용자의 문서가 조회되지 않음을 확인
- [ ] Lighthouse 성능·접근성 90 이상
