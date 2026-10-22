/* 도입 문의 — 폼·서버·메일이 같은 스키마와 문구를 쓴다. 원본 site.js 에서 옮김. */
import { z } from 'zod';

export const TEAM_SIZES   = ['1~10명', '11~50명', '51~200명', '200명 이상'];
export const MANUAL_TYPES = ['표준작업지침(SOP)', '신입 온보딩', '고객 응대', '안전·규정', '장비·도구 사용법', '기타'];
export const TOOLS        = ['노션', '구글 독스', '한글·워드', '사내 위키', '따로 없음'];
export const TIMELINES    = ['즉시', '1개월 안', '3개월 안', '검토 단계'];
export const NEEDS        = ['조직 단위 권한 관리', '문서 서식 고정', '도입 교육', '보안 검토 자료', 'SSO 연동'];

/** 제출 결과를 완료 화면으로 넘기는 sessionStorage 키 */
export const DONE_KEY = 'modu/inquiry-done';

export const PLAN_LABEL: Record<string, string> = { team: '팀', enterprise: '엔터프라이즈' };
export const planLabel = (p: string | null | undefined) => PLAN_LABEL[p ?? ''] || '엔터프라이즈';

const oneOf = (opts: string[], msg: string) =>
  z.string().refine(v => opts.includes(v), { message: msg });
const optionalOneOf = (opts: string[]) =>
  z.string().refine(v => v === '' || opts.includes(v));

/** 필수 7항목 — 오류 문구는 원본 validate() 그대로 */
export const inquirySchema = z.object({
  plan: z.enum(['팀', '엔터프라이즈']),
  company: z.string().trim().min(1, '회사·기관명을 입력해 주세요.').max(120),
  name: z.string().trim().min(1, '이름을 입력해 주세요.').max(60),
  title: z.string().trim().max(80),
  email: z.string().trim().max(200)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, '회신받을 이메일 주소를 정확히 입력해 주세요.'),
  phone: z.string().trim().max(40),
  teamSize: oneOf(TEAM_SIZES, '예상 사용 인원을 골라 주세요.'),
  manualTypes: z.array(z.string().refine(v => MANUAL_TYPES.includes(v)))
    .min(1, '만들려는 매뉴얼을 하나 이상 골라 주세요.'),
  currentTool: optionalOneOf(TOOLS),
  pain: z.string().trim().max(4000),
  timeline: oneOf(TIMELINES, '도입 희망 시기를 골라 주세요.'),
  needs: z.array(z.string().refine(v => NEEDS.includes(v))),
  note: z.string().trim().max(4000),
  consent: z.boolean().refine(v => v, '개인정보 수집·이용에 동의해 주세요.'),
  hp: z.string(), // 허니팟 — 사람은 비워 둔다
  source: z.string().max(200),
});
export type InquiryForm = z.input<typeof inquirySchema>;
export type InquiryData = z.output<typeof inquirySchema>;

export interface InquiryRecord extends Omit<InquiryData, 'hp'> {
  id: string;
  createdAt: number;
}

export const newInquiryId = () =>
  'INQ-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' +
  Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');

/** 서버에 닿지 못했을 때 완료 화면용으로 브라우저에서 만드는 레코드 */
export function localInquiryRecord(data: InquiryData, source: string): InquiryRecord {
  const { hp: _hp, ...rest } = data; // eslint-disable-line @typescript-eslint/no-unused-vars
  return { ...rest, source, id: newInquiryId(), createdAt: Date.now() };
}

const clipText = (s: string, n: number) => (String(s || '').length > n ? String(s).slice(0, n) + '…' : String(s || ''));

/** 메일 본문·복사용 텍스트 — 원본 inquiryText() 그대로 */
export function inquiryText(rec: InquiryRecord): string {
  const L: string[] = [];
  L.push('문의번호   ' + rec.id);
  L.push('접수일시   ' + new Date(rec.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
  L.push('관심 플랜   ' + rec.plan);
  L.push('');
  L.push('[연락처]');
  L.push('회사·기관  ' + rec.company);
  L.push('이름       ' + rec.name + (rec.title ? ' (' + rec.title + ')' : ''));
  L.push('이메일     ' + rec.email);
  if (rec.phone) L.push('연락처     ' + rec.phone);
  L.push('');
  L.push('[지금 상황]');
  L.push('예상 인원  ' + rec.teamSize);
  L.push('매뉴얼 종류 ' + rec.manualTypes.join(', '));
  if (rec.currentTool) L.push('현재 관리  ' + rec.currentTool);
  if (rec.pain) { L.push('가장 큰 어려움'); L.push('  ' + clipText(rec.pain, 800)); }
  L.push('');
  L.push('[도입 계획]');
  L.push('희망 시기  ' + rec.timeline);
  if (rec.needs.length) L.push('필요 기능  ' + rec.needs.join(', '));
  if (rec.note) { L.push('추가 요청'); L.push('  ' + clipText(rec.note, 800)); }
  L.push('');
  L.push('개인정보 수집·이용 동의 완료');
  return L.join('\r\n');
}

export const inquirySubject = (rec: Pick<InquiryRecord, 'company' | 'plan'>) =>
  '[도입 문의] ' + rec.company + ' · ' + rec.plan;

/** 메일 발송 실패 시 폴백 — 원본 inquiryMailto() */
export const inquiryMailto = (rec: InquiryRecord, to: string) =>
  'mailto:' + to +
  '?subject=' + encodeURIComponent(inquirySubject(rec)) +
  '&body=' + encodeURIComponent(inquiryText(rec));
