import type { Metadata } from 'next';
import { Block } from '@/components/Block';
import { ButtonLink } from '@/components/Button';
import { Cta, DocMock, Eyebrow, Lead, Row, Tile } from '@/components/site';

export const metadata: Metadata = {
  title: 'Tools',
  description: '목차 설계기, 초안 작성기, 다듬기, 검수기 — 문서를 쓰는 작업 화면과 네 가지 도구.',
};

export default function Tools() {
  return (
    <div className="page">
      <section className="wrap">
        <Lead h1 eyebrow="TOOLS" title="도구">
          <p className="body-lg">문서를 쓰는 작업 화면과, 그 안에서 쓰이는 네 가지 도구입니다.</p>
        </Lead>
      </section>

      <Block bg="cream" wide>
        <div className="split">
          <div className="split-side">
            <Eyebrow>WORKSPACE</Eyebrow>
            <h2 className="display-lg">모두의 매뉴얼</h2>
            <p className="subhead">문서함, 문서, AI 작업대가 한 화면에 있습니다. 브리프를 적는 것부터 내보내기까지 화면을 옮기지 않습니다.</p>
            <div className="hero-cta">
              <ButtonLink href="/editor">작업 화면 열기</ButtonLink>
              <ButtonLink variant="s" href="/product">먼저 흐름 보기</ButtonLink>
            </div>
            <p className="caption">저장은 자동 · 문서함은 계정에 보관</p>
          </div>
          <div><DocMock /></div>
        </div>
      </Block>

      <section className="wrap">
        <div className="grid grid-2">
          <Tile tag="OUTLINE" title="목차 설계기">브리프를 읽고 내용에 맞는 5~8개 섹션을 제안합니다. 각 섹션에 종류와 담을 내용이 함께 붙어, 무엇을 써야 할지 빈칸 앞에서 고민하지 않습니다.</Tile>
          <Tile tag="DRAFT" title="초안 작성기">섹션 하나씩 또는 전체를 한 번에 씁니다. 글이 써지는 과정이 그대로 보이고, 길어지면 중단할 수 있습니다.</Tile>
          <Tile tag="REFINE" title="다듬기">여덟 가지 방향과 직접 지시. 바꾸기 전 본문을 보관해 한 번에 되돌립니다.</Tile>
          <Tile tag="AUDIT" title="검수기">문서 전체를 읽고 실행할 수 없는 지시, 빠진 단계, 섹션 간 모순을 중요도와 함께 찾아냅니다.</Tile>
        </div>
      </section>

      <section className="wrap">
        <Lead eyebrow="EXPORT" title="가져갈 수 있어야 도구입니다." />
        <div className="rows">
          <Row k="Markdown (.md)">표제부가 표로 들어간 문서 전문. 노션, 깃허브, 위키에 그대로 붙습니다.</Row>
          <Row k="HTML (.html)">서체와 조판이 그대로 담긴 단독 파일. 인쇄하면 섹션이 페이지 중간에서 잘리지 않습니다.</Row>
          <Row k="전문 복사">클립보드로 바로. 사내 메신저나 문서 도구에 붙여 넣을 때.</Row>
        </div>
        <p className="body-sm note-line" style={{ marginTop: 24 }}>문서는 계정에 저장됩니다. 브라우저에도 사본이 남아 잠시 연결이 끊겨도 쓰던 문서를 잃지 않습니다.</p>
      </section>

      <Cta title="지금 열어서 한 건 만들어 보세요." sub="예시 문서가 들어 있어 빈 화면을 마주하지 않습니다." />
    </div>
  );
}
