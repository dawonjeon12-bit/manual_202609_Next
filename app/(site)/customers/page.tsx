import type { Metadata } from 'next';
import { Block } from '@/components/Block';
import { ButtonLink } from '@/components/Button';
import { Lead, Step } from '@/components/site';

export const metadata: Metadata = {
  title: 'Customers',
  description: '콘텐츠·고객지원·현장·매장 운영 팀이 매뉴얼 도구를 쓰는 방식과 도입 전 확인할 점.',
};

const PROFILES = [
  ['콘텐츠·마케팅팀', '사람마다 톤이 다르고, 검수 기준이 머릿속에만 있습니다.',
   '제작 절차와 반려 기준을 한 문서로 묶고, 발행 전 체크리스트를 붙입니다.',
   '담당자가 바뀌어도 같은 기준으로 나갑니다.'],
  ['고객지원팀', '같은 문의에 답이 사람마다 다르고, 판단이 필요한 건은 매번 되묻습니다.',
   '상황별 판단 기준을 표로 세우고 경계 사례를 예시로 붙입니다.',
   '되묻는 횟수가 줄고 답변이 고르게 됩니다.'],
  ['제조·현장', '작업 순서는 몸이 아는데 문서로는 남아 있지 않습니다.',
   '작업 단계를 담당자와 산출물이 드러나게 정리하고 안전 수칙을 경고 박스로 분리합니다.',
   '신규 인력 교육 기간이 줄어듭니다.'],
  ['프랜차이즈·매장 운영', '지점마다 운영 방식이 조금씩 다릅니다.',
   '개점부터 마감까지를 표준 절차로 세우고 지점 재량 범위를 기준으로 명시합니다.',
   '점검 기준이 하나로 모입니다.'],
];

export default function Customers() {
  return (
    <div className="page">
      <section className="wrap">
        <Lead h1 eyebrow="CUSTOMERS" title="이런 팀이 씁니다.">
          <p className="body-lg">아래는 실제 고객 사례가 아니라, 팀 유형별로 어떤 문제에 어떻게 쓰이는지 정리한 활용 시나리오입니다.</p>
        </Lead>
        <div className="grid grid-2">
          {PROFILES.map(([t, p, d, r]) => (
            <div key={t} className="card">
              <p className="caption">{t}</p>
              <div className="stack">
                <div><p className="pill-tag">문제</p><p className="body" style={{ marginTop: 8 }}>{p}</p></div>
                <hr className="rule" />
                <div><p className="pill-tag">하는 일</p><p className="body" style={{ marginTop: 8 }}>{d}</p></div>
                <hr className="rule" />
                <div><p className="pill-tag">남는 것</p><p className="body" style={{ marginTop: 8 }}>{r}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Block bg="pink" wide>
        <Lead wide eyebrow="BEFORE YOU START" title="도입 전에 확인하세요.">
          <p className="subhead">이 도구가 잘 맞는 조건과, 맞지 않는 조건이 있습니다. 솔직하게 적어 둡니다.</p>
        </Lead>
        <div className="split">
          <div className="split-side">
            <h3 className="headline">잘 맞는 경우</h3>
            <ul className="ticks on-ink">
              <li>담당자 머릿속에만 있는 반복 업무가 있다</li>
              <li>인수인계 때마다 같은 설명을 되풀이한다</li>
              <li>문서는 있는데 아무도 보지 않는다</li>
              <li>기준이 사람마다 다르게 적용된다</li>
            </ul>
          </div>
          <div className="split-side">
            <h3 className="headline">맞지 않는 경우</h3>
            <ul className="ticks on-ink">
              <li>사실관계를 외부에서 검증해야 하는 규정 문서</li>
              <li>법적 효력이 필요한 계약서나 약관</li>
              <li>매일 바뀌는 실시간 운영 지침</li>
            </ul>
          </div>
        </div>
      </Block>

      <section className="wrap">
        <Lead eyebrow="HOW TO START" title="도입은 한 문서부터." />
        <div className="steps">
          <Step n="01" title="가장 자주 묻는 업무 하나를 고릅니다">팀에서 같은 질문이 반복되는 업무가 첫 문서로 가장 좋습니다.</Step>
          <Step n="02" title="아는 사람이 브리프만 적습니다">문서를 쓰는 게 아니라 아는 것을 적습니다. 15분이면 충분합니다.</Step>
          <Step n="03" title="읽을 사람이 검수합니다">실제로 그 일을 맡을 사람이 읽고 막히는 곳을 표시합니다. 그 자리가 고칠 곳입니다.</Step>
        </div>
      </section>

      <Block bg="lilac" inClass="stack">
        <h2 className="display-lg">조직 단위로 도입하시나요?</h2>
        <p className="body-lg measure">사용 환경을 알려 주시면 맞는 구성과 도입 절차를 정리해 회신드립니다. 먼저 무료로 한 건 만들어 보셔도 좋습니다.</p>
        <div className="hero-cta">
          <ButtonLink href="/contact">도입 문의</ButtonLink>
          <ButtonLink variant="s" href="/editor">먼저 써 보기</ButtonLink>
        </div>
      </Block>
    </div>
  );
}
