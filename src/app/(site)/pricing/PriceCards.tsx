'use client';

import { useState } from 'react';
import { ButtonLink } from '@/components/Button';

const PLANS = [
  { id: 'free', name: '무료', m: 0, y: 0, desc: '혼자 써 보는 단계',
    feats: ['문서 3건', '목차 설계와 초안 작성', '다듬기 8종', 'Markdown·HTML 내보내기'], cta: '무료로 시작', primary: false, href: '/editor' },
  { id: 'team', name: '팀', m: 12000, y: 10000, desc: '팀이 함께 쓰는 단계',
    feats: ['문서 무제한', '검수기', '팀 문서함 공유', '공유 템플릿 등록', '개정 이력'], cta: '팀으로 시작', primary: true, href: '/contact?plan=team' },
  { id: 'ent', name: '엔터프라이즈', m: null, y: null, desc: '조직 표준으로 쓰는 단계',
    feats: ['팀 플랜 전체', '조직 단위 권한 관리', '문서 서식 고정', '도입 교육', '전담 지원'], cta: '도입 문의', primary: false, href: '/contact?plan=enterprise' },
] as const;

type Billing = 'month' | 'year';

/** 월간/연간 토글 + 플랜 카드 3종 */
export function PriceCards() {
  const [billing, setBilling] = useState<Billing>('year');

  return (
    <>
      <div className="toggle" role="group" aria-label="결제 주기">
        <button type="button" className={billing === 'month' ? 'is-on' : ''} aria-pressed={billing === 'month'}
          onClick={() => setBilling('month')}>월간</button>
        <button type="button" className={billing === 'year' ? 'is-on' : ''} aria-pressed={billing === 'year'}
          onClick={() => setBilling('year')}>연간 · 두 달 무료</button>
      </div>
      <div className="grid grid-3" style={{ marginTop: 32 }}>
        {PLANS.map(p => {
          const amount = p.m === null ? '문의'
            : p.m === 0 ? '0원'
            : (billing === 'year' ? p.y! : p.m).toLocaleString('ko-KR') + '원';
          const unit = p.m === null || p.m === 0 ? null : <small> / 사용자 · 월</small>;
          return (
            <div key={p.id} className="card">
              <h3 className="card-title">{p.name}</h3>
              <p className="body-sm note-line">{p.desc}</p>
              <p className="price">{amount}{unit}</p>
              <ButtonLink variant={p.primary ? 'p' : 's'} href={p.href}>{p.cta}</ButtonLink>
              <hr className="rule" />
              <ul className="ticks">{p.feats.map(f => <li key={f}>{f}</li>)}</ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
