'use client';

/* 스크롤 리빌 — 화면에 들어오는 묶음을 페이드인 + 작은 상승으로 보여 준다.
   사용: data-reveal            → 그 요소가 한 번에 등장
         data-reveal="stagger"  → 직계 자식들이 0.09초 간격으로 차례로 등장 (함께 읽는 묶음)

   안전장치
   - 숨김은 <html class="rv"> 일 때만 적용된다. 이 클래스는 RevealScript 가 스크립트 실행 + 동작 줄이기 꺼짐일 때만 붙인다.
     → 스크립트 미실행·동작 줄이기에서는 처음부터 다 보인다.
   - 이 감시 코드가 시작되면 rv-ready 를 붙인다. 2.5초 안에 못 붙이면 RevealScript 가 rv 를 떼어 전부 보여 준다.
   - 화면 아래쪽 8% 선을 넘은 것은 물론, 이미 위로 지나간 것도 바로 보여 준다(빠른 스크롤·바로가기·뒤로 가기).
   - 한 번 등장한 요소는 다시 숨기지 않는다. */
import { useEffect } from 'react';

const LINE = 0.92; // 요소의 윗변이 화면 높이의 92% 위로 올라오면 등장

export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('rv')) return;
    root.classList.add('rv-ready');

    let frame = 0;
    const check = () => {
      frame = 0;
      const limit = window.innerHeight * LINE;
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)').forEach(el => {
        if (el.getBoundingClientRect().top < limit) el.classList.add('is-revealed');
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };

    check();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    // 페이지 이동(메뉴)·탭 전환 등으로 새 요소가 생기면 다시 확인
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
      mo.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

/** <head> 에서 그리기 전에 실행 — 첫 화면이 깜빡이지 않도록 숨김 여부를 미리 정한다 */
export const REVEAL_BOOT = `(function(){try{
var r=document.documentElement;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
r.classList.add('rv');
setTimeout(function(){if(!r.classList.contains('rv-ready'))r.classList.remove('rv');},2500);
}catch(e){}})();`;
