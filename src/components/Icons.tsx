/* 홈 섹션용 선 아이콘 — 24px, currentColor */
import type { SVGProps } from 'react';

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p,
});

export const IconHandover = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 8h13l-3-3M20 16H7l3 3" /></svg>
);
export const IconShare = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.4" /><path d="M16 13.6a4.5 4.5 0 0 1 4.5 4.4" /></svg>
);
export const IconOps = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 12h4l2-5 4 10 2-5h6" /></svg>
);
export const IconPen = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>
);
export const IconLayers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></svg>
);
export const IconRefine = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
);
export const IconChevrons = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base({ width: 16, height: 16, ...p })}><path d="M6 6l6 6-6 6M12 6l6 6-6 6" /></svg>
);
export const IconLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M15 6l-6 6 6 6" /></svg>
);
export const IconRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>
);
