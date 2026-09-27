import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="site">
      <Nav />
      <main id="view">
        <div className="page">
          <section className="wrap">
            <div className="lead">
              <p className="eyebrow">404</p>
              <h1 className="display-lg">찾는 페이지가 없습니다.</h1>
              <p className="body-lg">주소가 바뀌었거나, 열 수 없는 문서입니다.</p>
            </div>
            <div className="hero-cta"><Link className="btn-p" href="/">홈으로</Link><Link className="btn-s" href="/editor">문서함 열기</Link></div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
