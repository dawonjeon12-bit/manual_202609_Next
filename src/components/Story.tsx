'use client';

/* 공감 장면 캐러셀 — 방문자가 “어, 이거 내 이야기인데?” 하고 멈추게 하는 구간.
   가로 스크롤(스냅) + 화살표 + 점 표시. 인수인계·공유·운영을 2개씩. */
import { useRef, useState } from 'react';
import { IconLeft, IconRight } from './Icons';

type Kind = '인수인계' | '공유' | '운영';

const SCENES: { when: string; kind: Kind; quote: string; text: string }[] = [
  { when: '금요일 17:40', kind: '인수인계',
    quote: '다음 주부터 휴가인데… 이걸 다 어떻게 설명하지?',
    text: '하던 일을 넘기려고 보니 머릿속에만 있는 게 너무 많습니다.' },
  { when: '화요일 14:00', kind: '공유',
    quote: '저기, 이거 법카로 결제해도 되는 거예요?',
    text: '같은 질문에 이번 달만 다섯 번째 답하는 중입니다.' },
  { when: '분기 첫날', kind: '운영',
    quote: '분기마다 하는 일인데… 지난번엔 어떻게 했더라?',
    text: '1년에 몇 번 안 하는 일이라 할 때마다 처음처럼 헤맵니다.' },
  { when: '월요일 09:10', kind: '인수인계',
    quote: '전임자분이 남긴 문서가… 2년 전 거네요.',
    text: '넘겨받은 문서는 오래됐고, 물어볼 사람은 이미 다른 팀에 있습니다.' },
  { when: '수요일 11:30', kind: '공유',
    quote: '지난번엔 이렇게 하라고 하셨잖아요.',
    text: '사람마다 기준이 달라서 같은 일을 두 번 하게 됩니다.' },
  { when: '월말 마감일', kind: '운영',
    quote: '그건 ○○ 님만 알아요. 오늘 휴가세요.',
    text: '한 사람이 빠지자 마감이 멈췄습니다.' },
];

export function Story() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const cardStep = () => {
    const t = track.current;
    const card = t?.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + parseFloat(getComputedStyle(t!).columnGap || '0') : 0;
  };
  const go = (i: number) => {
    const t = track.current;
    if (t) t.scrollTo({ left: Math.max(0, Math.min(SCENES.length - 1, i)) * cardStep(), behavior: 'smooth' });
  };
  const onScroll = () => {
    const step = cardStep();
    if (step) setActive(Math.round(track.current!.scrollLeft / step));
  };

  return (
    <section className="h-block-sec">
      <div className="wrap"><div className="h-block h-cream">
        <div className="h-row-head">
          <div className="h-lead">
            <p className="h-eyebrow">SOUND FAMILIAR?</p>
            <h2 className="h-title">이런 순간,<br />한 번쯤 <span className="hl">있으셨죠?</span></h2>
            <p className="h-sub">인수인계, 업무 공유, 서비스 운영 — 매뉴얼이 없을 때 회사에서 자주 벌어지는 장면들입니다.</p>
          </div>
          <div className="h-arrows">
            <button type="button" className="h-arrow" aria-label="이전 장면" onClick={() => go(active - 1)} disabled={active <= 0}><IconLeft /></button>
            <button type="button" className="h-arrow" aria-label="다음 장면" onClick={() => go(active + 1)} disabled={active >= SCENES.length - 1}><IconRight /></button>
          </div>
        </div>

        <div className="h-track" ref={track} onScroll={onScroll} role="list" aria-label="공감 장면">
          {SCENES.map(s => (
            <figure key={s.when} className="h-scene" data-kind={s.kind} role="listitem">
              <div className="h-scene-top">
                <span className="h-scene-when">{s.when}</span>
                <span className="h-scene-kind">{s.kind}</span>
              </div>
              <blockquote className="h-bubble">{s.quote}</blockquote>
              <figcaption className="h-scene-text">{s.text}</figcaption>
            </figure>
          ))}
        </div>

        <div className="h-dots" aria-hidden="true">
          {SCENES.map((s, i) => <button key={s.when} type="button" tabIndex={-1} className={i === active ? 'is-on' : ''} onClick={() => go(i)} />)}
        </div>
      </div></div>
    </section>
  );
}
