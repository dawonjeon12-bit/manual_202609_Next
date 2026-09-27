/* 플랜 — 요금 페이지와 사용량 제한이 같은 출처를 본다. */

export type PlanId = 'free' | 'team' | 'enterprise';

/** 월 AI 호출 상한. 섹션 1개 작성 = 1회, ‘전체 초안’은 섹션 수만큼. null = 무제한 */
export const AI_MONTHLY_LIMIT: Record<PlanId, number | null> = {
  free: 60,
  team: 1500,
  enterprise: null,
};

export const planOf = (p: string | null | undefined): PlanId =>
  p === 'team' || p === 'enterprise' ? p : 'free';
