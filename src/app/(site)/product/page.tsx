import type { Metadata } from 'next';
import { Block } from '@/components/Block';
import { Cta, DocMock, Eyebrow, Lead, Row, Step } from '@/components/site';

export const metadata: Metadata = {
  title: 'Product',
  description: '브리프 적기부터 목차 설계, 본문 작성, 다듬기, 검수, 내보내기까지 여섯 단계.',
};

const KINDS = [
  ['개요', '목적과 적용 범위, 적용 예외를 나눠 씁니다.'],
  ['절차', '번호 단계로 쓰되 담당자·기한·산출물이 드러나게 씁니다.'],
  ['체크리스트', '눈으로 보고 예/아니오를 판단할 수 있는 항목만 남깁니다.'],
  ['기준', '판단 기준을 표로 정리하고 경계 사례를 붙입니다.'],
  ['주의', '실제로 자주 나는 사고와 결과, 예방 행동을 씁니다.'],
  ['FAQ', '질문과 답을 짝지어 네댓 개로 정리합니다.'],
  ['용어', '사내 용어와 줄임말을 표로 풀어 씁니다.'],
  ['양식', '문서에 들어갈 항목을 표나 목록으로 제시합니다.'],
];

const REFINES = ['더 짧게', '더 자세히', '단계로 바꾸기', '체크리스트로',
                 '표로 정리', '신입 눈높이', '주의사항 보강', '문체 통일'];

export default function Product() {
  return (
    <div className="page">
      <section className="wrap">
        <Lead h1 eyebrow="PRODUCT" title={<>브리프에서 배포까지,<br />여섯 단계.</>}>
          <p className="body-lg">정리되지 않은 메모 한 덩어리에서 시작해, 다른 사람이 그대로 따라 할 수 있는 문서로 끝냅니다.</p>
        </Lead>
        <div className="steps">
          <Step n="01" title="브리프 적기">어떤 업무인지, 누가 읽는지, 왜 쓰는지 적습니다. 정리되지 않은 메모나 기존 문서, 대화 기록을 그대로 붙여넣어도 됩니다.</Step>
          <Step n="02" title="목차 설계">내용의 성격을 판단해 5~8개 섹션으로 뼈대를 세웁니다. 각 섹션에는 종류와 담을 내용이 함께 붙습니다.</Step>
          <Step n="03" title="본문 작성">섹션마다 종류에 맞는 서식으로 씁니다. 절차는 단계로, 점검은 체크박스로, 기준은 표로 나옵니다.</Step>
          <Step n="04" title="다듬기">섹션을 고르고 방향을 선택합니다. 마음에 들지 않으면 되돌립니다.</Step>
          <Step n="05" title="검수">문서 전체를 읽고 실행할 수 없는 지시와 빠진 단계를 찾습니다. 지적한 곳에서 바로 고치기로 넘어갑니다.</Step>
          <Step n="06" title="내보내기">Markdown이나 HTML로 저장하거나 전문을 복사합니다. 문서함에 남아 다음 개정 때 이어 씁니다.</Step>
        </div>
      </section>

      <Block bg="lime" wide>
        <Lead wide eyebrow="SECTION TYPES" title="섹션 종류가 서식을 바꿉니다.">
          <p className="subhead">여덟 가지 종류 중 무엇인지에 따라 같은 내용도 다르게 조판됩니다. 종류는 언제든 바꿀 수 있고, 바꾸면 조판도 따라 바뀝니다.</p>
        </Lead>
        <div className="rows">{KINDS.map(([k, v]) => <Row key={k} k={k}>{v}</Row>)}</div>
      </Block>

      <section className="wrap split">
        <div className="split-side">
          <Eyebrow>FORMATTING</Eyebrow>
          <h2 className="display-lg">읽히도록 조판합니다.</h2>
          <p className="body-lg">본문은 명조, 소제목과 표는 고딕, 번호와 수치는 등폭. 한글은 어절 단위로 줄바꿈해 문장이 중간에서 끊기지 않습니다.</p>
          <ul className="ticks on-ink">
            <li>절차는 번호 칩과 연결선이 붙은 단계 목록으로</li>
            <li>점검 항목은 체크박스가 있는 상자로</li>
            <li>경고는 인장 적색 띠가 붙은 박스로</li>
            <li>표는 세로선 없이 가로 리듬만으로</li>
          </ul>
        </div>
        <div><DocMock /></div>
      </section>

      <Block bg="lilac" wide>
        <Lead wide eyebrow="REFINE" title="한 번에 맞지 않아도 됩니다.">
          <p className="subhead">초안이 길면 줄이고, 어려우면 눈높이를 낮춥니다. 여덟 가지 방향 중 고르거나 직접 지시를 적습니다. 되돌리기가 있습니다.</p>
        </Lead>
        <div className="notes">{REFINES.map(t => <div key={t} className="note"><b>{t}</b></div>)}</div>
      </Block>

      <Block bg="mint" wide>
        <Lead wide eyebrow="SAFEGUARD" title="지어내지 않게 막아 두었습니다.">
          <p className="subhead">업무 매뉴얼에서 가장 위험한 것은 그럴듯한 거짓입니다. 담당자 이름, 시스템 이름, 기한, 수치처럼 확인이 필요한 값은 비워 두지 않고 〈확인 필요〉로 표시합니다.</p>
        </Lead>
        <div className="rows">
          <Row k="표시해 둡니다">브리프에 없는 고유명사와 숫자는 임의로 채우지 않습니다.</Row>
          <Row k="되돌릴 수 있습니다">다듬기 전 본문을 보관해 한 번에 되돌립니다.</Row>
          <Row k="멈출 수 있습니다">작성이 길어지면 중단하고, 쓰던 데까지는 남습니다.</Row>
        </div>
      </Block>

      <Cta title="작성 흐름을 직접 따라가 보세요." sub="예시 문서가 하나 들어 있습니다. 지우고 새로 시작해도 됩니다." />
    </div>
  );
}
