'use client';

/* 히어로 예시 — 입력한 내용이 매뉴얼로 만들어지는 과정.
   왼쪽: 붙여넣는 원문(회의록 · 내 업무 설명 · 메신저 대화 · 기존 문서)
   가운데: 정리 과정(읽기 → 나누기 → 정리)
   오른쪽: 단계별 안내 · 기준표 · 체크리스트
   원문 문장은 도착할 섹션의 색(단계=라일락, 기준=라임, 점검=민트)으로 칠해져 어디로 가는지 보여 준다.
   장식용 시연이라 내용은 스크린리더에 숨기고, 탭은 키보드로 고를 수 있다. */
import { useEffect, useState } from 'react';

type To = 'step' | 'rule' | 'check';
type Line = { text: string; to?: To; who?: string };

const SOURCES: { id: string; label: string; lines: Line[] }[] = [
  { id: 'meeting', label: '회의록', lines: [
    { text: '10/14 경영지원 주간회의' },
    { text: '- 법카 영수증은 쓴 날 바로 사진으로 올리기', to: 'step' },
    { text: '- 5만 원 넘는 건 팀장 승인 받고 제출', to: 'rule' },
    { text: '- 정산 마감은 매월 25일로 통일', to: 'step' },
    { text: '- 회식비 1인 3만 원, 참석자 명단 필수', to: 'rule' },
    { text: '- 제출 전에 누락 없는지 본인이 확인', to: 'check' },
  ] },
  { id: 'mywork', label: '내 업무 설명', lines: [
    { text: '제가 맡은 법인카드 정산은요,' },
    { text: '쓰신 날 영수증 사진부터 올려 달라고 안내해요.', to: 'step' },
    { text: '5만 원이 넘으면 팀장님 승인이 있어야 하고요.', to: 'rule' },
    { text: '회식은 1인 3만 원까지, 참석자 명단도 같이요.', to: 'rule' },
    { text: '매달 25일까지 모아서 재무팀에 넘깁니다.', to: 'step' },
    { text: '명단이랑 영수증 빠진 게 제일 많아요.', to: 'check' },
  ] },
  { id: 'chat', label: '메신저 대화', lines: [
    { who: '김 매니저', text: '법카 정산 언제까지예요?' },
    { who: '나', text: '25일까지요! 영수증 사진 꼭 올려 주세요', to: 'step' },
    { who: '김 매니저', text: '회식비도 돼요?' },
    { who: '나', text: '1인 3만 원까지요, 참석자 명단 같이요', to: 'rule' },
    { who: '나', text: '5만 원 넘으면 팀장님 승인 먼저요', to: 'rule' },
    { who: '나', text: '빠진 거 없는지 한 번만 보고 내 주세요', to: 'check' },
  ] },
  { id: 'doc', label: '기존 문서·지침', lines: [
    { text: '[경비 처리 지침 발췌]' },
    { text: '제3조 증빙은 사용일에 정산 시스템에 등록한다.', to: 'step' },
    { text: '제5조 건당 5만 원 초과 시 부서장 승인을 받는다.', to: 'rule' },
    { text: '제6조 식대는 1인 3만 원 이내로 한다.', to: 'rule' },
    { text: '제8조 정산은 매월 25일까지 제출한다.', to: 'step' },
    { text: '별표 1. 제출 전 확인 사항', to: 'check' },
  ] },
];

const PROCESS = ['내용 읽기', '단계 · 기준 · 점검 나누기', '매뉴얼로 정리'];

// 0 원문 · 1 문장 분류(색칠) · 2 제목 · 3 단계 · 4 기준표 · 5 체크리스트 · 6 완성(머묾)
type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const DURATION: Record<Stage, number> = { 0: 900, 1: 2000, 2: 600, 3: 900, 4: 900, 5: 900, 6: 2800 };
const processOf = (s: Stage) => (s <= 0 ? 0 : s === 1 ? 1 : s < 6 ? 2 : 3); // 3 = 모두 완료

export function MakeDemo() {
  const [src, setSrc] = useState(0);
  const [stage, setStage] = useState<Stage>(0);
  const [auto, setAuto] = useState(true);
  const [reduced, setReduced] = useState(false);

  // 동작 줄이기 설정이면 완성된 장면만 보여 주고 넘기지 않는다
  useEffect(() => {
    const t = setTimeout(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setReduced(true); setStage(6); }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => {
      if (stage < 6) { setStage((stage + 1) as Stage); return; }
      if (auto) setSrc(i => (i + 1) % SOURCES.length);
      setStage(0);
    }, DURATION[stage]);
    return () => clearTimeout(t);
  }, [stage, auto, reduced]);

  const pick = (i: number) => { setAuto(false); setSrc(i); setStage(reduced ? 6 : 0); };
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const n = (i + (e.key === 'ArrowRight' ? 1 : SOURCES.length - 1)) % SOURCES.length;
      pick(n);
      (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
    }
  };

  const s = SOURCES[src];
  const tagged = s.lines.filter(l => l.to);
  const on = (from: Stage) => (stage >= from ? ' is-in' : '');
  const proc = processOf(stage);

  return (
    <div className="mk" data-stage={stage}>
      <div className="mk-bar" aria-hidden="true">
        <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
        <span>모두의 매뉴얼 · 새 매뉴얼</span>
      </div>

      <div className="mk-body">
        {/* 입력 */}
        <section className="mk-in" aria-label="붙여넣는 내용 예시">
          <p className="mk-label">이런 내용을 붙여넣으세요</p>
          <div className="mk-tabs" role="tablist" aria-label="붙여넣는 내용의 종류">
            {SOURCES.map((x, i) => (
              <button key={x.id} type="button" role="tab" aria-selected={i === src} tabIndex={i === src ? 0 : -1}
                className={`mk-tab${i === src ? ' is-on' : ''}`} onClick={() => pick(i)} onKeyDown={e => onTabKey(e, i)}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="mk-paper" data-kind={s.id} aria-hidden="true" key={s.id}>
            {s.lines.map((l, i) => {
              const order = l.to ? tagged.indexOf(l) : -1;
              return (
                <p key={i} className={`mk-line${l.to && stage >= 1 ? ' is-' + l.to : ''}${l.who ? ' is-chat' : ''}${l.who === '나' ? ' is-me' : ''}`}
                  style={{ '--d': `${Math.max(order, 0) * 280}ms`, '--i': i } as React.CSSProperties}>
                  {l.who && <span className="mk-who">{l.who}</span>}
                  <span className="mk-text">{l.text}</span>
                </p>
              );
            })}
          </div>
          <p className="mk-more">인수인계 메모, 엑셀 정리본, 공지문도 그대로 넣으면 됩니다.</p>
        </section>

        {/* 정리 과정 */}
        <ol className="mk-proc" aria-label="AI가 정리하는 과정">
          {PROCESS.map((p, i) => (
            <li key={p} className={`${i < proc ? 'is-done' : ''}${i === proc ? ' is-now' : ''}`}>
              <span className="mk-proc-num" aria-hidden="true">{i < proc ? '✓' : i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>

        {/* 결과 */}
        <section className="mk-out" aria-hidden="true">
          <div className={`mk-head${on(2)}`}>
            <p className="mk-kind">사내 업무 매뉴얼</p>
            <p className="mk-title">법인카드 비용 정산 매뉴얼</p>
          </div>

          <div className={`mk-sec${on(3)}`}>
            <p className="mk-sec-h"><span className="mk-chip" data-to="step">단계별 안내</span>정산 절차</p>
            <ol className="mk-steps">
              <li><b>증빙 등록</b> — 사용 당일 영수증 사진 업로드</li>
              <li><b>승인 요청</b> — 5만 원 초과 시 팀장 승인</li>
              <li><b>제출</b> — 매월 25일까지 정산 제출</li>
            </ol>
          </div>

          <div className={`mk-sec${on(4)}`}>
            <p className="mk-sec-h"><span className="mk-chip" data-to="rule">기준표</span>항목별 정산 기준</p>
            <table className="mk-table">
              <thead><tr><th>항목</th><th>기준</th><th>필요한 것</th></tr></thead>
              <tbody>
                <tr><td>식대·회식</td><td>1인 3만 원 이내</td><td>참석자 명단</td></tr>
                <tr><td>5만 원 초과</td><td>팀장 승인 후 제출</td><td>승인 기록</td></tr>
              </tbody>
            </table>
          </div>

          <div className={`mk-sec${on(5)}`}>
            <p className="mk-sec-h"><span className="mk-chip" data-to="check">체크리스트</span>제출 전 점검</p>
            <ul className="mk-checks">
              <li>영수증 사진을 올렸는가</li>
              <li>회식이면 참석자 명단을 첨부했는가</li>
              <li>25일 마감 전에 제출했는가</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
