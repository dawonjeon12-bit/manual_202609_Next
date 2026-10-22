import type { ReactNode } from 'react';
import { Eyebrow } from './site';

/* 개인정보처리방침·이용약관 공통 틀 */
export function LegalPage({ eyebrow, title, effective, intro, children }:
  { eyebrow: string; title: string; effective: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className="page">
      <section className="wrap">
        <div className="lead">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="display-lg">{title}</h1>
          <p className="body-lg">{intro}</p>
          <p className="caption note-line">시행일 {effective}</p>
        </div>
        <div className="legal">{children}</div>
      </section>
    </div>
  );
}

export function Article({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="legal-article">
      <h2 className="headline"><span className="num">{String(n).padStart(2, '0')}</span>{title}</h2>
      <div className="legal-body">{children}</div>
    </section>
  );
}
