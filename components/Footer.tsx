import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">모두의 매뉴얼</div>
            <p className="body-sm measure-tight">AI와 함께 내용에 맞는 업무 매뉴얼을 만드는 도구.</p>
          </div>
          <div className="footer-col">
            <h4>제품</h4>
            <Link href="/product">기능</Link>
            <Link href="/product">작성 흐름</Link>
            <Link href="/tools">도구</Link>
            <Link href="/pricing">요금</Link>
          </div>
          <div className="footer-col">
            <h4>활용</h4>
            <Link href="/customers">팀별 활용</Link>
            <Link href="/customers">도입 준비</Link>
            <Link href="/community">템플릿</Link>
          </div>
          <div className="footer-col">
            <h4>커뮤니티</h4>
            <Link href="/community">포럼</Link>
            <Link href="/community">변경 로그</Link>
            <Link href="/community">밋업</Link>
          </div>
          <div className="footer-col">
            <h4>지원</h4>
            <Link href="/editor">작업 화면 열기</Link>
            <Link href="/pricing">자주 묻는 질문</Link>
            <Link href="/contact">도입 문의</Link>
          </div>
        </div>
        <div className="footer-base">
          <p className="caption">&copy; 2026 모두의 매뉴얼</p>
          <p className="caption">Made in Seoul</p>
        </div>
      </div>
    </footer>
  );
}
