'use client';

/* 화면 아래에 떠 있는 바로가기 — 도입 문의 · 매뉴얼 만들기.
   첫 화면의 버튼과 겹치지 않게 조금 내려온 뒤부터 보인다. */
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { ButtonLink } from './Button';

const SHOW_AFTER = 480; // px

const subscribe = (cb: () => void) => {
  window.addEventListener('scroll', cb, { passive: true });
  window.addEventListener('resize', cb);
  return () => { window.removeEventListener('scroll', cb); window.removeEventListener('resize', cb); };
};
const scrolledPast = () => window.scrollY > SHOW_AFTER;

export function FloatingCta() {
  const pathname = usePathname();
  const visible = useSyncExternalStore(subscribe, scrolledPast, () => false);
  const onContact = pathname.startsWith('/contact');

  return (
    <nav className={`fcta${visible ? ' is-on' : ''}`} aria-label="빠른 이동" inert={!visible}>
      <p className="fcta-text">업무 매뉴얼, 지금 바로 시작해 보세요</p>
      <div className="fcta-actions">
        {!onContact && <ButtonLink variant="s" small href="/contact">도입 문의</ButtonLink>}
        <ButtonLink small href="/editor">매뉴얼 만들기</ButtonLink>
      </div>
    </nav>
  );
}
