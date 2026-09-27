/* 프롬프트 — 원본 app.js 의 문구를 그대로 옮겼다. 고치지 말 것 (plan §3 #52).
   FORMAT_RULES 의 〈확인 필요〉 규칙이 ‘지어내기 방지’ 안전장치다.

   섹션 작성 프롬프트는 prefix(브리프·전체 목차) + rest(지금 쓸 섹션 이하)로 나눠 반환한다.
   둘을 이어 붙이면 원본과 한 글자도 다르지 않다. 전체 초안에서 섹션을 연달아 쓸 때
   prefix 가 prompt cache 에 걸리도록 하기 위한 분리다. */
import { SEC_TYPES, REFINE, type Manual, type Section, type RefineId } from './manual';

type Doc = Pick<Manual, 'title' | 'brief' | 'sections'>;

const clip = (s: string | null | undefined, n: number) =>
  (String(s || '').length > n ? String(s).slice(0, n) + '\n…(이하 생략)' : String(s || ''));

export function briefBlock(doc: Doc): string {
  const b = doc.brief || ({} as Doc['brief']);
  return `[매뉴얼 제목] ${doc.title || '(미정)'}
[다루는 업무] ${b.topic || '(미기재)'}
[읽는 사람] ${b.audience || '(미기재)'}
[쓰는 목적] ${b.purpose || '(미기재)'}
[문체] ${b.tone || '간결한 지시체'}
[상세도] ${b.depth || '표준 (실무용)'}
[참고 원문]
${clip(b.raw, 6000) || '(없음)'}`;
}

export const FORMAT_RULES = `서식 규칙 — 아래 문법만 씁니다.
- 설명은 문단으로 씁니다.
- 순서가 있는 단계는 "1. " 번호 목록으로 쓰고, 각 단계는 "**단계 이름** — 무엇을 어떻게" 형태로 씁니다.
- 순서가 없는 나열은 "- " 목록으로 씁니다.
- 눈으로 확인할 점검 항목은 "- [ ] " 로 씁니다.
- 비교·분류는 | 로 구분한 마크다운 표로 씁니다.
- 반드시 지켜야 할 경고는 "> " 로 시작하는 한두 문장으로 씁니다.
- 강조는 **굵게**, 버튼·파일명·설정값은 \`백틱\`으로 감쌉니다.
- 필요하면 "### " 소제목을 씁니다. 섹션 제목 자체는 다시 쓰지 않습니다.
- 사실을 지어내지 않습니다. 담당자·시스템 이름·기한·수치처럼 확인이 필요한 값은 〈확인 필요〉 로 표시합니다.
- 인사말이나 "알겠습니다" 같은 말 없이 본문만 출력합니다.`;

export function outlinePrompt(doc: Doc): string {
  return `당신은 기업의 업무 매뉴얼을 설계하는 문서 전문가입니다.
아래 브리프를 읽고, 이 내용에 가장 알맞은 매뉴얼 목차를 설계하세요.

${briefBlock(doc)}

설계 원칙
- 내용의 성격에 맞춰 구조를 다르게 잡으세요. 순서가 중요한 업무면 단계 중심, 판단이 중요한 업무면 기준과 사례 중심, 도구 사용법이면 준비·설정·문제 해결 중심으로 잡습니다.
- 섹션은 5~8개. 첫 섹션은 목적과 적용 범위로 열고, 마지막은 자주 묻는 질문이나 문제 해결로 닫는 편이 좋습니다.
- type은 반드시 다음 중 하나: ${SEC_TYPES.join(', ')}
- title은 14자 이내의 한국어 명사구.
- hint는 그 섹션에 무엇을 담을지 한 문장으로.

다른 말 없이 JSON 배열만 출력하세요.
예: [{"title":"목적과 적용 범위","type":"개요","hint":"이 매뉴얼이 다루는 업무 범위와 예외 상황"}]`;
}

export function sectionPrompt(doc: Doc, sec: Section): { prefix: string; rest: string } {
  const outline = doc.sections.map((x, i) => `${i + 1}. ${x.title} (${x.type})`).join('\n');
  const prefix = `당신은 기업의 업무 매뉴얼을 쓰는 문서 전문가입니다.
아래 매뉴얼의 한 섹션 본문만 작성하세요.

${briefBlock(doc)}

[전체 목차]
${outline}

`;
  const rest = `[지금 쓸 섹션]
제목: ${sec.title}
종류: ${sec.type}
담을 내용: ${sec.hint || '(제목에서 판단)'}

종류별 요령
- 개요: 목적, 적용 범위, 적용 예외를 나눠 씁니다.
- 절차: 번호 단계로 쓰되 각 단계에 담당자·기한·산출물이 드러나게 씁니다.
- 체크리스트: "- [ ] " 항목만 7~12개. 예/아니오로 판단 가능한 문장으로 씁니다.
- 기준: 판단 기준을 표로 정리하고 경계 사례를 덧붙입니다.
- 주의: 실제로 자주 나는 사고와 그 결과, 예방 행동을 씁니다.
- FAQ: "**Q. 질문**" 다음 줄에 "A. 답" 형태로 4~6개.
- 용어: 표로 용어와 뜻을 정리합니다.
- 양식: 문서에 들어갈 항목을 표나 목록으로 제시합니다.

분량은 ${doc.brief?.depth || '표준 (실무용)'} 수준, 문체는 ${doc.brief?.tone || '간결한 지시체'}로 씁니다.
다른 섹션이 맡은 내용은 반복하지 마세요.

${FORMAT_RULES}`;
  return { prefix, rest };
}

export function refinePrompt(doc: Doc, sec: Section, actionId: RefineId | null, note: string): string {
  const action = REFINE.find(r => r.id === actionId);
  return `당신은 기업의 업무 매뉴얼을 다듬는 편집자입니다.
아래 매뉴얼의 한 섹션을 요청대로 고쳐 쓰세요.

[매뉴얼] ${doc.title || '(제목 없음)'}
[읽는 사람] ${doc.brief?.audience || '(미기재)'}
[섹션] ${sec.title} (${sec.type})

[요청]
${action ? action.inst : ''}${action && note ? '\n' : ''}${note ? '추가 지시: ' + note : ''}

[현재 본문]
${clip(sec.body, 12000)}

${FORMAT_RULES}

고쳐 쓴 본문 전체를 출력하세요. 바뀐 부분만 출력하지 마세요.`;
}

export function reviewPrompt(doc: Doc): string {
  const body = doc.sections.map((s, i) => `## ${i + 1}. ${s.title} (${s.type})\n${s.body || '(비어 있음)'}`).join('\n\n');
  return `당신은 사내 문서를 심사하는 감사 담당자입니다.
아래는 실제 업무 매뉴얼 전문입니다. 이 업무를 처음 맡는 사람이 이 문서만 보고 일을 끝낼 수 있는지 검수하세요.

찾아야 할 것
- 실행할 수 없는 모호한 지시 ("적절히", "신속하게", "필요시" 등)
- 판단 기준 없이 판단만 요구하는 문장
- 빠진 단계, 빠진 예외 상황
- 담당자·기한·산출물이 명시되지 않은 절차
- 섹션끼리 어긋나는 내용
- 비어 있거나 제목만 있는 섹션

[매뉴얼 제목] ${doc.title || '(제목 없음)'}
[읽는 사람] ${doc.brief?.audience || '(미기재)'}

${clip(body, 40000)}

최대 8개, 중요한 것부터. 잘된 점은 쓰지 마세요.
severity는 높음 / 보통 / 낮음 중 하나, section은 위 섹션 제목 그대로.
다른 말 없이 JSON 배열만 출력하세요.
예: [{"severity":"높음","section":"콘텐츠 제작 절차","issue":"검수 요청 기한만 있고 검수 완료 기한이 없다","fix":"검수자가 몇 영업일 안에 회신해야 하는지 명시"}]`;
}
