/* 원본 site.js 의 조각 함수들 (eyebrow, tile, row, step, cta, docMock) */
import type { ReactNode } from 'react';
import { ButtonLink } from './Button';

export const Eyebrow = ({ children }: { children: ReactNode }) => <p className="eyebrow">{children}</p>;

export function Tile({ tag, title, children }: { tag: string; title: string; children: ReactNode }) {
  return (
    <div className="tile">
      <p className="caption">{tag}</p>
      <h3 className="card-title">{title}</h3>
      <p className="body-sm">{children}</p>
    </div>
  );
}

export function Row({ k, children }: { k: string; children: ReactNode }) {
  return <div className="row"><p className="headline">{k}</p><p className="body">{children}</p></div>;
}

export function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="step">
      <p className="num">{n}</p>
      <div className="step-body"><h3 className="headline">{title}</h3><p className="body">{children}</p></div>
    </div>
  );
}

export function Lead({ eyebrow, title, wide, h1, children }:
  { eyebrow: string; title: ReactNode; wide?: boolean; h1?: boolean; children?: ReactNode }) {
  const H = h1 ? 'h1' : 'h2';
  return (
    <div className={wide ? 'lead lead-wide' : 'lead'}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <H className={h1 ? 'display-xl' : 'display-lg'}>{title}</H>
      {children}
    </div>
  );
}

export function Cta({ title, sub }: { title: string; sub: string }) {
  return (
    <section className="wrap">
      <div className="block" data-bg="cream">
        <div className="block-in stack">
          <h2 className="display-lg">{title}</h2>
          <p className="body-lg measure">{sub}</p>
          <div className="hero-cta">
            <ButtonLink href="/editor">작업 화면 열기</ButtonLink>
            <ButtonLink variant="s" href="/pricing">요금 보기</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DocMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-bar"><span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
        <span>ASC-CON-001 · REV 1.2</span></div>
      <div className="mock-body">
        <div className="mock-h">콘텐츠 제작·검수 운영 매뉴얼</div>
        <div className="mock-meta"><span>시행 2026-09-01</span><span>콘텐츠운영팀</span><span>승인 운영팀장</span></div>
        <div className="mock-sec">
          <div className="mock-sec-h"><span className="mock-chip">개요</span><b>목적과 적용 범위</b></div>
          <div className="mock-line" data-w="90" /><div className="mock-line" data-w="76" />
        </div>
        <div className="mock-sec">
          <div className="mock-sec-h"><span className="mock-chip" data-c="lilac">절차</span><b>콘텐츠 제작 절차</b></div>
          <div className="mock-line" data-w="90" /><div className="mock-line" data-w="60" /><div className="mock-line" data-w="76" />
        </div>
        <div className="mock-sec">
          <div className="mock-sec-h"><span className="mock-chip" data-c="mint">체크리스트</span><b>발행 전 점검</b></div>
          <div className="mock-line" data-w="45" /><div className="mock-line" data-w="60" />
        </div>
      </div>
    </div>
  );
}
