import { auth } from '@/auth';

export interface SessionUser { id: string; role: 'USER' | 'ADMIN'; email: string | null }

/** 로그인한 사용자. 없으면 null. Route Handler 와 서버 컴포넌트에서 쓴다. */
export async function currentUser(): Promise<SessionUser | null> {
  const s = await auth();
  if (!s?.user?.id) return null;
  return { id: s.user.id, role: s.user.role ?? 'USER', email: s.user.email ?? null };
}
