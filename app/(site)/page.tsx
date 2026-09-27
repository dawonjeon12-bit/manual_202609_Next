import type { Metadata } from 'next';
import { Block } from '@/components/Block';
import { ButtonLink } from '@/components/Button';
import { Marquee } from '@/components/Marquee';
import { Cta, DocMock, Eyebrow, Lead, Row, Tile } from '@/components/site';

export const metadata: Metadata = {
  title: { absolute: '모두의 매뉴얼' },
  description: '브리프 한 장이면 목차가 섭니다. 내용에 맞는 구조로 업무 매뉴얼을 쓰는 AI 도구.',
};

const TEMPLATES = [
  ['SOP', '표준작업지침서', '순서가 정해진 반복 업무'],
  ['ONBOARD', '신입 온보딩', '첫 2주에 해야 할 일'],
  ['SUPPORT', '고객 응대 스크립트', '상황별 판단 기준과 문구'],
  ['SAFETY', '안전·규정 수칙', '지키지 않으면 생기는 일'],
  ['TOOL', '도구 사용법', '준비물, 설정, 문제 해결'],
  ['HANDOVER', '인수인계서', '남은 일과 남긴 맥락'],
  ['VENDOR', '외주 작업 가이드', '요청 양식과 검수 기준'],
  ['STORE', '매장 운영 매뉴얼', '개점부터 마감까지'],
];

export default function Home() {
  return (
    <div className="page">
      <section className="wrap hero">
        <div className="hero-copy">
          <Eyebrow>AI MANUAL BUILDER</Eyebrow>
          <h1 className="display-xl">업무 매뉴얼을<br />내용에 맞는 구조로.</h1>
          <p className="body-lg measure">브리프 한 장이면 목차가 섭니다. 절차인지 판단 기준인지 도구 사용법인지 먼저 가리고, 거기에 맞는 서식으로 씁니다.</p>
          <div className="hero-cta">
            <ButtonLink href="/editor">무료로 시작하기</ButtonLink>
            <ButtonLink variant="s" href="/product">작성 흐름 보기</ButtonLink>
          </div>
          <p className="caption">문서 3건까지 무료 · 설치 없이 브라우저에서</p>
        </div>
        <div><DocMock /></div>
      </section>

      <Marquee />

      <section className="wrap">
        <Lead eyebrow="WHY" title="빈 템플릿을 주지 않습니다.">
          <p className="body-lg">대부분의 매뉴얼 도구는 서식을 주고 채우게 합니다. 채우는 일이 어려운 게 아니라, 무엇을 어떤 순서로 담을지 정하는 일이 어렵습니다.</p>
        </Lead>
        <div className="grid grid-3">
          <Tile tag="STRUCTURE" title="구조부터 정합니다">같은 분량이라도 순서가 중요한 업무와 판단이 중요한 업무는 목차가 달라야 합니다. 브리프를 읽고 구조를 먼저 제안합니다.</Tile>
          <Tile tag="REVIEW" title="빠진 것을 찾습니다">오타가 아니라 담당자 없는 절차, 기한 없는 단계, 기준 없는 판단 요구를 찾아 중요도와 함께 알려 줍니다.</Tile>
          <Tile tag="HANDOVER" title="사람이 바뀌어도 남습니다">문서번호와 개정 차수, 시행일, 관리부서를 문서 서식에 고정해 두었습니다. 규정집이 관리되는 방식 그대로입니다.</Tile>
        </div>
      </section>

      <Block bg="lime" wide>
        <Lead wide eyebrow="STRUCTURE" title="내용이 구조를 정합니다.">
          <p className="subhead">같은 “매뉴얼”이라도 담긴 내용에 따라 필요한 뼈대가 다릅니다. 브리프를 읽고 셋 중 어느 쪽인지 판단한 뒤 목차를 세웁니다.</p>
        </Lead>
        <div className="rows">
          <Row k="순서가 중요할 때">단계 중심으로 세웁니다. 각 단계에 담당자, 기한, 산출물이 드러나게 씁니다. 예: 콘텐츠 제작 절차, 입점 심사.</Row>
          <Row k="판단이 중요할 때">기준과 경계 사례 중심으로 세웁니다. 표로 등급을 나누고 애매한 상황을 예시로 붙입니다. 예: 반려 기준, 환불 정책.</Row>
          <Row k="도구가 중심일 때">준비물, 설정, 문제 해결 순으로 세웁니다. 자주 나는 오류를 뒤쪽에 모읍니다. 예: 장비 사용법, 사내 시스템 안내.</Row>
        </div>
      </Block>

      <Block bg="navy" wide>
        <Lead wide eyebrow="REVIEW" title={<>다 쓰고 나서,<br />읽는 사람 입장으로 한 번 더.</>}>
          <p className="subhead">이 업무를 처음 맡는 사람이 이 문서만 보고 일을 끝낼 수 있는지 점검합니다. 찾은 항목은 중요도와 고칠 방향을 함께 보여 줍니다.</p>
        </Lead>
        <ul className="ticks">
          <li>“적절히”, “신속하게”, “필요시” 처럼 실행할 수 없는 지시</li>
          <li>판단 기준 없이 판단만 요구하는 문장</li>
          <li>담당자나 기한, 산출물이 빠진 절차</li>
          <li>섹션끼리 어긋나는 내용</li>
          <li>제목만 있고 비어 있는 섹션</li>
        </ul>
      </Block>

      <Block bg="coral" wide>
        <Lead wide eyebrow="AFTER" title="쓴 다음이 더 깁니다.">
          <p className="subhead">매뉴얼은 한 번 쓰고 끝나지 않습니다. 고쳐 쓰고, 나눠 주고, 다시 고칩니다.</p>
        </Lead>
        <div className="grid grid-3">
          <div><h3 className="headline">개정 관리</h3><p className="body">개정 차수와 시행일을 문서 표제부에 고정합니다.</p></div>
          <div><h3 className="headline">내보내기</h3><p className="body">Markdown과 HTML로 저장합니다. 인쇄하면 섹션이 페이지 중간에서 잘리지 않습니다.</p></div>
          <div><h3 className="headline">문서함</h3><p className="body">계정에 저장되어 어느 기기에서 열어도 같은 문서함입니다.</p></div>
        </div>
      </Block>

      <section className="wrap">
        <Lead eyebrow="TEMPLATES" title="어디서부터 쓸지 막막하면.">
          <p className="body-lg">브리프에 무엇을 적어야 할지 감이 오지 않을 때, 업무 유형별 출발점을 골라 시작하세요.</p>
        </Lead>
        <div className="grid grid-4">
          {TEMPLATES.map(([t, n, d]) => <Tile key={t} tag={t} title={n}>{d}</Tile>)}
        </div>
      </section>

      <Cta title="첫 매뉴얼을 오늘 끝내세요." sub="브리프를 적고 목차를 받는 데까지 1분이면 충분합니다." />
    </div>
  );
}
