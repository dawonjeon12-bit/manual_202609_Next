'use client';

/* 첫 화면 시연 — 메모 → AI가 구성을 잡아 매뉴얼로 → 메모를 덧붙이면 반영.
   홈의 STEP 1(처음 구성)·STEP 2(덧붙일수록 쉽게)를 한 장면으로 보여 준다.
   장식용이라 스크린리더에는 숨기고, 동작 줄이기 설정이면 완성된 장면만 보여 준다. */
import { useEffect, useState } from 'react';

// 0 메모 · 1 구성 잡는 중 · 2 섹션 작성 · 3 새 메모 반영 · 4 완료(잠시 머묾)
type Stage = 0 | 1 | 2 | 3 | 4;
const DURATION: Record<Stage, number> = { 0: 1600, 1: 1400, 2: 3200, 3: 2600, 4: 2600 };
const STATUS: Record<Stage, string> = {
  0: '메모를 읽는 중…',
  1: '알맞은 구성을 잡는 중…',
  2: '섹션을 쓰는 중…',
  3: '새 내용을 반영하는 중…',
  4: '반영했습니다 · 누구나 읽히는 형태로',
};

export function HeroDemo() {
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const t = setTimeout(() => setStage(4), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage(s => ((s + 1) % 5) as Stage), DURATION[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  const shown = (from: Stage) => (stage >= from ? ' is-in' : '');
  const merged = stage >= 3;

  return (
    <div className="demo" data-stage={stage} aria-hidden="true">
      <div className="demo-memo">
        <span className="demo-memo-label">내 메모</span>
        법카 쓰면 영수증 찍어서 월말 전에 올리기… 5만 원 넘으면 팀장님 승인. 회식비 한도가 얼마더라?
      </div>

      <div className={`demo-memo demo-memo-add${shown(3)}`}>
        <span className="demo-memo-label">+ 메모 추가</span>
        회식비는 1인 3만 원까지
      </div>

      <div className="demo-doc">
        <div className="mock-bar">
          <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
          <span>ADM-EXP-001 · REV 1.2</span>
        </div>

        <div className="demo-status">
          <span className="pulse" />
          <span>{STATUS[stage]}</span>
        </div>

        <div className="demo-body">
          <div className={`demo-head${shown(1)}`}>
            <div className="mock-h">법인카드 비용 정산 매뉴얼</div>
            <div className="mock-meta"><span>시행 2026-10-01</span><span>경영지원팀</span><span>승인 재무팀장</span></div>
          </div>

          <div className={`demo-sec${shown(2)}`} style={{ '--d': '0ms' } as React.CSSProperties}>
            <div className="mock-sec-h"><span className="mock-chip" data-c="cream">개요</span><b>목적과 적용 범위</b></div>
            <p className="demo-p">누가 쓰더라도 같은 기준으로 정산하도록 증빙, 승인, 마감 기준을 정한다.</p>
          </div>

          <div className={`demo-sec${shown(2)}`} style={{ '--d': '450ms' } as React.CSSProperties}>
            <div className="mock-sec-h"><span className="mock-chip" data-c="lilac">절차</span><b>정산 절차</b></div>
            <ol className="demo-steps">
              <li><b>증빙 등록</b> — 사용 당일 영수증 사진 업로드</li>
              <li><b>승인 요청</b> — 5만 원 초과 시 팀장 승인</li>
              <li><b>제출</b> — 매월 25일까지 정산 제출</li>
            </ol>
          </div>

          <div className={`demo-sec${shown(2)}`} style={{ '--d': '900ms' } as React.CSSProperties}>
            <div className="mock-sec-h"><span className="mock-chip" data-c="mint">체크리스트</span><b>제출 전 점검</b></div>
            <ul className="demo-checks"><li>사용 목적을 적었는가</li><li>회식이면 참석자 명단 첨부</li></ul>
          </div>

          <div className={`demo-sec demo-warn${shown(2)}`} style={{ '--d': '1350ms' } as React.CSSProperties}>
            <span className="demo-warn-label">반드시</span>
            25일 이후 제출은 다음 달로 이월. 회식비 한도는{' '}
            {merged
              ? <mark className="demo-merged">1인 3만 원<span className="demo-merged-tag">반영됨</span></mark>
              : <mark className="demo-todo">〈확인 필요〉</mark>}
          </div>
        </div>
      </div>
    </div>
  );
}
