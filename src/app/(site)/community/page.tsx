import type { Metadata } from 'next';
import { Block } from '@/components/Block';
import { ButtonLink } from '@/components/Button';
import { Cta, Lead, Row } from '@/components/site';

export const metadata: Metadata = {
  title: 'Community',
  description: '공유 템플릿, 포럼, 변경 로그, 월간 밋업 — 매뉴얼을 쓰는 사람들의 모임.',
};

const TOPICS: [string, string, number][] = [
  ['절차 매뉴얼에서 단계를 얼마나 쪼개야 하나요', '작성 요령', 42],
  ['체크리스트 항목이 30개를 넘어갑니다', '작성 요령', 28],
  ['검수 결과를 팀에 공유하는 방법', '운영', 19],
  ['개정 차수를 언제 올리나요', '문서 관리', 31],
  ['외주사에 보낼 가이드는 어디까지 적어야 할까요', '활용 사례', 15],
];

const LOGS = [
  ['2026.09.12', '조판 개선', '표에서 세로선을 없애고 가로 리듬만 남겼습니다. 본문 서체를 본명조로 바꾸고 한글 어절 단위 줄바꿈을 적용했습니다.'],
  ['2026.08.28', '검수기 개선', '지적한 항목에서 해당 섹션 다듬기로 바로 넘어갑니다.'],
  ['2026.08.14', '섹션 종류 8종', '용어와 양식 종류를 추가했습니다. 종류를 바꾸면 조판도 함께 바뀝니다.'],
  ['2026.07.30', '문서함 동기화', '계정에 저장되어 어느 기기에서 열어도 같은 문서함입니다.'],
];

const SHARED = [
  ['SOP', '입고 검수 절차'], ['ONBOARD', '에디터 첫 2주'], ['SUPPORT', '환불 판단 기준'],
  ['SAFETY', '장비 점검 수칙'], ['STORE', '개점 준비 30분'], ['VENDOR', '촬영 외주 요청서'],
];

export default function Community() {
  return (
    <div className="page">
      <section className="wrap">
        <Lead h1 eyebrow="COMMUNITY" title={<>잘 쓴 매뉴얼은<br />돌려 읽을 만합니다.</>}>
          <p className="body-lg">다른 팀이 어떤 구조로 썼는지 보는 것이 가장 빠른 학습입니다.</p>
        </Lead>
        <div className="promo">
          <p className="body-sm"><b>9월 밋업</b> · 현장 업무를 문서로 남기는 법 — 9월 26일 저녁 7시, 온라인</p>
          <ButtonLink variant="m" small href="/community">자리 맡기</ButtonLink>
        </div>
      </section>

      <section className="wrap">
        <Lead eyebrow="TEMPLATES" title="공유 템플릿">
          <p className="body-lg">쓰던 문서에서 내용을 지우고 구조만 남겨 공유합니다. 가져다 브리프만 바꿔 쓰세요.</p>
        </Lead>
        <div className="notes">{SHARED.map(([t, n]) => <div key={t} className="note"><b>{t}</b>{n}</div>)}</div>
      </section>

      <Block bg="lilac" wide>
        <Lead wide eyebrow="FORUM" title="막히는 곳은 대체로 같습니다.">
          <p className="subhead">단계를 얼마나 쪼갤지, 체크리스트를 어디서 끊을지. 먼저 겪은 사람들의 답이 쌓여 있습니다.</p>
        </Lead>
        <div className="log">
          {TOPICS.map(([t, c, n]) => (
            <div key={t} className="log-item">
              <p className="pill-tag">{c}</p>
              <div><p className="body">{t}</p><p className="caption note-line" style={{ marginTop: 6 }}>답변 {n}</p></div>
            </div>
          ))}
        </div>
      </Block>

      <section className="wrap">
        <Lead eyebrow="CHANGELOG" title="변경 로그" />
        <div className="log">
          {LOGS.map(([d, t, b]) => (
            <div key={d} className="log-item">
              <p className="caption">{d}</p>
              <div><h3 className="headline">{t}</h3><p className="body" style={{ marginTop: 6 }}>{b}</p></div>
            </div>
          ))}
        </div>
      </section>

      <Block bg="mint" wide>
        <Lead wide eyebrow="MEETUP" title="한 달에 한 번 모입니다.">
          <p className="subhead">문서를 실제로 쓰는 사람들이 각자의 매뉴얼을 들고 와 구조를 뜯어봅니다. 온라인이고 무료입니다.</p>
        </Lead>
        <div className="rows">
          <Row k="9월 26일">현장 업무를 문서로 남기는 법 — 제조·물류 팀 사례</Row>
          <Row k="10월 24일">판단 기준을 표로 세우는 법 — 고객지원 팀 사례</Row>
          <Row k="11월 28일">개정을 감당할 수 있는 문서 구조</Row>
        </div>
      </Block>

      <Cta title="먼저 한 건 만들고 오세요." sub="들고 올 문서가 있으면 밋업이 훨씬 유용합니다." />
    </div>
  );
}
