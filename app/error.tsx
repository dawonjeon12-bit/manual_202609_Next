'use client';

import Link from 'next/link';

/** 라우트 오류 바운더리 — 사이트·편집기 공통 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="site">
      <div className="page">
        <section className="wrap">
          <div className="lead">
            <p className="eyebrow">ERROR</p>
            <h1 className="display-lg">화면을 여는 중에 문제가 생겼습니다.</h1>
            <p className="body-lg">잠시 뒤 다시 시도해 주세요. 작업 중이던 문서는 이 브라우저에 사본이 남아 있습니다.</p>
          </div>
          <div className="hero-cta">
            <button className="btn-p" type="button" onClick={reset}>다시 시도</button>
            <Link className="btn-s" href="/">홈으로</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
