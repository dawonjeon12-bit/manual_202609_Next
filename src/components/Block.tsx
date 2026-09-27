import type { ReactNode } from 'react';

/* 컬러 블록 8종 — 이 디자인 시스템의 서명 */
export type BlockBg = 'lime' | 'lilac' | 'cream' | 'pink' | 'mint' | 'coral' | 'navy' | 'soft';

export function Block({ bg, wide, inClass, children }:
  { bg: BlockBg; wide?: boolean; inClass?: string; children: ReactNode }) {
  return (
    <section className="wrap">
      <div className={`block${bg === 'navy' ? ' on-dark' : ''}`} data-bg={bg}>
        <div className={['block-in', wide && 'block-wide', inClass].filter(Boolean).join(' ')}>{children}</div>
      </div>
    </section>
  );
}
