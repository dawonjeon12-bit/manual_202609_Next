export default function Loading() {
  return (
    <div className="mx">
      <div className="app">
        <header className="topbar">
          <div className="brand"><span className="brand-mark" aria-hidden="true">모</span><span className="brand-name">모두의 매뉴얼</span></div>
          <div className="topbar-mid"><span className="save-state" aria-live="polite">불러오는 중…</span></div>
        </header>
      </div>
    </div>
  );
}
