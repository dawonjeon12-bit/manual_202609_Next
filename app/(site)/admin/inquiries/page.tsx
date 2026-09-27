import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/session';
import { Eyebrow } from '@/components/site';

export const metadata: Metadata = { title: '문의함', robots: { index: false } };
export const dynamic = 'force-dynamic';

const when = (d: Date) => d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

export default async function Inbox() {
  const user = await currentUser();
  if (!user) redirect('/login?callbackUrl=/admin/inquiries');

  if (user.role !== 'ADMIN') {
    return (
      <div className="page">
        <section className="wrap">
          <div className="lead">
            <Eyebrow>INBOX</Eyebrow>
            <h1 className="display-lg">열람 권한이 없습니다.</h1>
            <p className="body-lg">문의함은 관리자 계정으로만 열 수 있습니다.</p>
          </div>
        </section>
      </div>
    );
  }

  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  // 개인정보 열람 기록 (plan §7 — 관리자 접근 로그)
  console.info('[admin] 문의함 열람', { admin: user.email, count: rows.length, at: new Date().toISOString() });

  return (
    <div className="page">
      <section className="wrap">
        <div className="lead">
          <Eyebrow>INBOX</Eyebrow>
          <h1 className="display-lg">받은 도입 문의</h1>
          <p className="body-lg">내비게이션에 없는 화면입니다. 관리자 계정으로만 열립니다.</p>
        </div>
        <div className="inq">
          {!rows.length && <p className="body">아직 받은 문의가 없습니다.</p>}
          {rows.map(r => (
            <div key={r.id} className="inq-card">
              <div className="inq-top">
                <span className="pill-tag">{r.id}</span>
                <span className="pill-tag">{r.plan}</span>
                {!r.mailed && <span className="pill-tag">메일 미발송</span>}
                <span className="caption note-line">{when(r.createdAt)}</span>
              </div>
              <h3 className="card-title">{r.company}</h3>
              <dl className="inq-dl">
                <dt>담당자</dt><dd>{r.name}{r.jobTitle ? ' · ' + r.jobTitle : ''}</dd>
                <dt>이메일</dt><dd>{r.email}{r.phone ? ' · ' + r.phone : ''}</dd>
                <dt>예상 인원</dt><dd>{r.teamSize || '-'}</dd>
                <dt>매뉴얼 종류</dt><dd>{r.manualTypes.join(', ') || '-'}</dd>
                <dt>현재 관리</dt><dd>{r.currentTool || '-'}</dd>
                <dt>희망 시기</dt><dd>{r.timeline || '-'}</dd>
                <dt>필요 기능</dt><dd>{r.needs.join(', ') || '-'}</dd>
                {r.pain && <><dt>어려움</dt><dd>{r.pain}</dd></>}
                {r.note && <><dt>추가 요청</dt><dd>{r.note}</dd></>}
              </dl>
              <div className="hero-cta">
                <a className="btn-s btn-sm"
                  href={`mailto:${r.email}?subject=${encodeURIComponent('[모두의 매뉴얼] 도입 문의 회신 · ' + r.id)}`}>회신하기</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
