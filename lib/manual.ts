/* 매뉴얼 문서 모델과 상수 — 원본 app.js 의 SEC_TYPES, REFINE, sampleDoc(), blankDoc(). */

export const SEC_TYPES = ['개요', '절차', '체크리스트', '기준', '주의', 'FAQ', '용어', '양식'] as const;
export type SecType = (typeof SEC_TYPES)[number];

export const TONES = ['간결한 지시체', '친절한 설명체', '규정 문어체'] as const;
export const DEPTHS = ['핵심만 (요약본)', '표준 (실무용)', '아주 상세 (교육용)'] as const;

export interface Brief {
  topic: string;
  audience: string;
  purpose: string;
  tone: string;
  depth: string;
  raw: string;
}

export interface Section {
  id: string;
  type: string;
  title: string;
  body: string;
  hint: string;
}

export interface Manual {
  id: string;
  title: string;
  kind: string;
  code: string;
  rev: string;
  effectiveDate: string;
  owner: string;
  approver: string;
  sample: boolean;
  brief: Brief;
  sections: Section[];
  updatedAt: number;
}

/** 문서함 목록에 필요한 만큼만 */
export interface ManualSummary {
  id: string;
  title: string;
  code: string;
  sample: boolean;
  sectionCount: number;
  updatedAt: number;
}

export const REFINE = [
  { id: 'short',  label: '더 짧게',      inst: '핵심만 남기고 분량을 절반 가까이 줄이세요. 수치·기한·조건은 절대 지우지 마세요.' },
  { id: 'long',   label: '더 자세히',    inst: '각 항목에 왜 그렇게 해야 하는지와 실수하기 쉬운 지점을 덧붙여 더 자세히 쓰세요.' },
  { id: 'steps',  label: '단계로 바꾸기', inst: '내용을 순서가 있는 번호 목록의 실행 단계로 재구성하세요. 각 단계는 한 사람이 한 번에 끝낼 수 있는 크기여야 합니다.' },
  { id: 'check',  label: '체크리스트로',  inst: '내용을 "- [ ] "로 시작하는 점검 항목으로 재구성하세요. 각 항목은 눈으로 확인해 예/아니오를 판단할 수 있어야 합니다.' },
  { id: 'table',  label: '표로 정리',     inst: '비교하거나 분류할 수 있는 내용을 마크다운 표로 재구성하세요. 표로 만들 수 없는 설명은 표 앞뒤에 문단으로 남기세요.' },
  { id: 'newbie', label: '신입 눈높이',   inst: '이 업무를 처음 하는 사람이 읽는다고 가정하고, 줄임말과 사내 용어를 풀어 쓰세요. 생략된 전제를 드러내세요.' },
  { id: 'risk',   label: '주의사항 보강', inst: '이 업무에서 실제로 자주 일어나는 실수와 그 결과를 찾아 "> "로 시작하는 경고 문장으로 덧붙이세요.' },
  { id: 'tone',   label: '문체 통일',     inst: '문장을 지시형으로 통일하고 중복·군더더기 표현을 정리하세요. 내용 자체는 바꾸지 마세요.' },
] as const;
export type RefineId = (typeof REFINE)[number]['id'];

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

export const blankBrief = (): Brief =>
  ({ topic: '', audience: '', purpose: '', tone: '간결한 지시체', depth: '표준 (실무용)', raw: '' });

/** 새 문서 기본값 (id·updatedAt 은 DB가 정한다) */
export function blankDoc(): Omit<Manual, 'id' | 'updatedAt'> {
  return {
    title: '', kind: '업무 매뉴얼',
    code: '', rev: '1.0', effectiveDate: new Date().toISOString().slice(0, 10),
    owner: '', approver: '', sample: false,
    brief: blankBrief(),
    sections: [],
  };
}

/** 신규 가입 시 1건 생성하는 예시 문서 — 원본 sampleDoc() 내용 그대로 */
export function sampleDoc(): Omit<Manual, 'id' | 'updatedAt'> {
  const S = (type: string, title: string, body: string): Section => ({ id: uid(), type, title, body, hint: '' });
  return {
    sample: true,
    title: '콘텐츠 제작·검수 운영 매뉴얼',
    kind: '업무 매뉴얼',
    code: 'ASC-CON-001', rev: '1.2', effectiveDate: '2026-09-01',
    owner: '콘텐츠운영팀', approver: '운영팀장',
    brief: {
      topic: '브랜드 SNS 채널에 나가는 콘텐츠를 기획해서 검수하고 발행하기까지의 전 과정',
      audience: '입사 1개월 차 콘텐츠 에디터',
      purpose: '인수인계 없이도 혼자 한 건을 끝까지 처리할 수 있게',
      tone: '간결한 지시체', depth: '표준 (실무용)', raw: '',
    },
    sections: [
      S('개요', '목적과 적용 범위',
`이 매뉴얼은 브랜드 채널에 발행되는 모든 콘텐츠의 기획·제작·검수 절차를 표준화하여, 담당자가 바뀌어도 같은 품질과 톤을 유지하는 것을 목적으로 한다.

### 적용 범위

- 인스타그램, 유튜브 쇼츠, 자사 블로그에 발행되는 자체 제작 콘텐츠
- 외부 협력사가 만들고 자사 채널로 나가는 콘텐츠

### 적용 예외

- 실시간 이슈 대응 게시물. 팀장 구두 승인으로 검수를 대체하되, 발행 후 24시간 안에 사후 기록을 남긴다.`),

      S('기준', '역할과 책임',
`| 역할 | 담당 | 책임 범위 |
| --- | --- | --- |
| 기획 | 콘텐츠 PD | 주제 선정, 레퍼런스 조사, 기획안 작성 |
| 제작 | 에디터 | 원고·이미지 제작, 1차 자체 검수 |
| 검수 | 팀장 | 사실관계·표현·법적 리스크 최종 확인 |
| 발행 | 채널 운영자 | 예약 등록, 발행 후 지표 확인 |

한 사람이 제작과 검수를 겸할 수 없다. 불가피한 경우 팀 내 다른 에디터에게 교차 검수를 요청한다.`),

      S('절차', '콘텐츠 제작 절차',
`1. **주제 등록** — 매주 월요일 11시까지 콘텐츠 캘린더에 다음 주 주제를 등록한다.
2. **기획안 작성** — 목표 지표, 타깃, 핵심 메시지 한 줄, 레퍼런스 3건을 담는다.
3. **기획 확정** — 화요일 정기 회의에서 확정한다. 미확정 건은 다음 주로 이월한다.
4. **초안 제작** — 확정일로부터 3영업일 안에 초안을 올린다.
5. **검수 요청** — 발행 예정일 2일 전까지 검수를 요청한다.
6. **수정 반영** — 반려 사유당 1회 수정이 원칙이다.
7. **예약 발행** — 발행 전날 18시까지 예약 등록을 마친다.

> 발행 2일 전을 넘긴 검수 요청은 그 주 발행에서 제외한다. 마감을 당겨 검수를 건너뛰는 것보다 일정을 이월하는 편이 낫다.`),

      S('체크리스트', '발행 전 검수 체크리스트',
`- [ ] 핵심 메시지가 첫 3초(또는 첫 두 줄) 안에 드러나는가
- [ ] 수치·인용·인물 정보의 출처를 확인했는가
- [ ] 타사 상표, 이미지 저작권, 폰트 라이선스를 확인했는가
- [ ] 광고성 콘텐츠에 \`유료 광고 포함\` 표기가 있는가
- [ ] 오탈자와 띄어쓰기를 소리 내어 한 번 더 읽었는가
- [ ] 본문과 프로필의 링크가 모두 열리는가
- [ ] 채널별 규격(비율, 길이, 글자 수)에 맞는가`),

      S('기준', '반려 기준',
`검수자는 아래에 해당하면 반려한다. 반려할 때는 사유를 항목으로 남긴다.

| 등급 | 사유 | 조치 |
| --- | --- | --- |
| 즉시 반려 | 사실관계 오류, 저작권 침해 소지 | 재제작 |
| 수정 후 발행 | 톤 불일치, 오탈자 3건 이상 | 당일 수정 |
| 조건부 발행 | 사소한 표현 차이 | 발행 후 수정 |`),

      S('FAQ', '자주 묻는 질문',
`**Q. 기획 확정 전에 제작을 시작해도 되나요?**
A. 권장하지 않는다. 확정 전 제작물은 반려되어도 별도 보상 대상이 아니다.

**Q. 검수자가 휴가일 때는 어떻게 하나요?**
A. 대리 검수자를 캘린더에 미리 지정한다. 지정이 없으면 팀장이 검수한다.

**Q. 발행 후 오류를 발견하면 어떻게 하나요?**
A. 발견 즉시 게시물을 내리고 팀 채널에 공유한다. 수정본은 재검수를 거쳐 다시 발행한다.`),
    ],
  };
}
