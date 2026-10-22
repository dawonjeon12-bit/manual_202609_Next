'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ButtonLink } from './Button';

const ROUTES = [
  { path: '/',          label: 'Home' },
  { path: '/product',   label: 'Product' },
  { path: '/tools',     label: 'Tools' },
  { path: '/customers', label: 'Customers' },
  { path: '/community', label: 'Community' },
  { path: '/pricing',   label: 'Pricing' },
];

/** 편집기의 ‘← 사이트로’가 돌아올 곳 */
export const LAST_SITE_PATH_KEY = 'modu/last-site-path';
/** 도입 문의의 ‘어디서 왔는지(source)’ */
export const PREV_SITE_PATH_KEY = 'modu/prev-site-path';

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // 라우트가 바뀌면 오버레이를 닫는다 (렌더 중 상태 조정 — effect 에서 setState 하지 않는다)
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  // 마지막 사이트 경로를 기억한다
  useEffect(() => {
    try {
      const last = sessionStorage.getItem(LAST_SITE_PATH_KEY);
      if (last && last !== pathname) sessionStorage.setItem(PREV_SITE_PATH_KEY, last);
      sessionStorage.setItem(LAST_SITE_PATH_KEY, pathname);
    } catch { /* 저장 불가 */ }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const links = ROUTES.map(r => (
    <Link key={r.path} href={r.path} className={`nav-link${r.path === pathname ? ' is-on' : ''}`}
      aria-current={r.path === pathname ? 'page' : undefined} onClick={() => setOpen(false)}>
      {r.label}
    </Link>
  ));

  return (
    <>
      <header className="nav">
        <div className="nav-in">
          <Link className="wordmark" href="/"><span className="wordmark-mark" aria-hidden="true">모</span>모두의 매뉴얼</Link>
          <nav className="nav-links" aria-label="주요 메뉴">{links}</nav>
          <div className="nav-cta">
            <ButtonLink variant="s" small href="/pricing">요금 보기</ButtonLink>
            <ButtonLink small href="/editor">무료로 시작</ButtonLink>
            <button className="btn-icon nav-burger" type="button" aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={open} aria-controls="navOverlay" onClick={() => setOpen(o => !o)}>☰</button>
          </div>
        </div>
      </header>
      <div className="nav-overlay" id="navOverlay" hidden={!open}>{links}</div>
    </>
  );
}
