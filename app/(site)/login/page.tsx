import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { Eyebrow } from '@/components/site';

export const metadata: Metadata = { title: '로그인', robots: { index: false } };

/** 같은 사이트 안의 경로만 돌아갈 곳으로 받는다 (오픈 리다이렉트 방지) */
const safePath = (p?: string) => (p && p.startsWith('/') && !p.startsWith('//') ? p : '/editor');

export default async function Login({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const { callbackUrl, error } = await searchParams;
  const to = safePath(callbackUrl);
  if (await auth()) redirect(to);

  return (
    <div className="page">
      <section className="wrap">
        <div className="block" data-bg="cream">
          <div className="block-in stack">
            <Eyebrow>SIGN IN</Eyebrow>
            <h1 className="display-lg">문서함은 계정에 저장됩니다.</h1>
            <p className="body-lg measure">로그인하면 예시 문서가 하나 들어 있는 문서함이 열립니다. 어느 기기에서 열어도 같은 문서함입니다.</p>
            {error && <p className="ferr" role="alert">로그인하지 못했습니다. 다시 시도해 주세요.</p>}
            <form action={async () => { 'use server'; await signIn('google', { redirectTo: to }); }}>
              <div className="hero-cta"><button className="btn-p" type="submit">Google 계정으로 계속</button></div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
