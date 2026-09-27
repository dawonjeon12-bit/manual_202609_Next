import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/* 알약 버튼 4종 — .btn-p(기본) .btn-s(보조) .btn-t(텍스트) .btn-m(마젠타) */
type Variant = 'p' | 's' | 't' | 'm';

const cls = (variant: Variant, small?: boolean, extra?: string) =>
  [`btn-${variant}`, small && 'btn-sm', extra].filter(Boolean).join(' ');

export function ButtonLink({ variant = 'p', small, className, children, ...rest }:
  { variant?: Variant; small?: boolean; children: ReactNode } & ComponentProps<typeof Link>) {
  return <Link className={cls(variant, small, className)} {...rest}>{children}</Link>;
}

export function Button({ variant = 'p', small, className, type = 'button', ...rest }:
  { variant?: Variant; small?: boolean } & ComponentProps<'button'>) {
  return <button type={type} className={cls(variant, small, className)} {...rest} />;
}
