/* 마키 — 두 벌을 이어 붙여 -50% 까지 흘린다. 감속 설정이면 멈춘다 (site.css). */
const MARQUEE = ['표준작업지침', '신입 온보딩', '고객 응대 스크립트', '장비 사용법', '안전 수칙',
                 '반려 기준', '발행 전 체크리스트', '인수인계 문서', '외주 가이드', '입점 절차'];

export function Marquee() {
  const run = MARQUEE.map(t => [<span key={t}>{t}</span>, <i key={t + '/'}>/</i>]);
  return (
    <section className="marquee" aria-hidden="true">
      <div className="marquee-track">{run}{MARQUEE.map(t => [<span key={t + '2'}>{t}</span>, <i key={t + '2/'}>/</i>])}</div>
    </section>
  );
}
