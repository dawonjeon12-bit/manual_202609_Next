'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Eyebrow } from '@/components/site';
import { DONE_KEY, inquiryMailto, inquiryText, type InquiryRecord } from '@/lib/inquiry';

type Done = { record: InquiryRecord; saved: boolean; mailed: boolean };

export function DoneView({ to }: { to: string }) {
  const [done, setDone] = useState<Done | null | undefined>(undefined);
  const [copyLabel, setCopyLabel] = useState('내용 복사');

  useEffect(() => {
    try { setDone(JSON.parse(sessionStorage.getItem(DONE_KEY) || 'null')); } catch { setDone(null); }
  }, []);

  if (done === undefined) return <div className="page" />;

  if (!done) {
    return (
      <div className="page">
        <section className="wrap">
          <div className="lead">
            <Eyebrow>CONTACT</Eyebrow>
            <h1 className="display-lg">표시할 접수 내역이 없습니다.</h1>
            <p className="body-lg">이 화면은 문의를 보낸 직후에만 열립니다.</p>
          </div>
          <div className="hero-cta"><Link className="btn-p" href="/contact">도입 문의</Link><Link className="btn-s" href="/">홈으로</Link></div>
        </section>
      </div>
    );
  }

  const { record: rec, saved, mailed } = done;

  const copy = async () => {
    try { await navigator.clipboard.writeText(inquiryText(rec)); setCopyLabel('복사했습니다'); }
    catch { setCopyLabel('복사할 수 없습니다'); }
    setTimeout(() => setCopyLabel('내용 복사'), 2400);
  };

  const note = mailed
    ? '담당자에게 메일로 전달했고, 접수 확인 메일도 보내 드렸습니다. 메일이 보이지 않으면 아래 버튼으로 다시 보내 주세요.'
    : saved
      ? '내용은 저장되었습니다. 위 버튼은 담당자 메일함으로 곧바로 전달하고 싶을 때 쓰세요.'
      : '지금은 서버에 저장되지 않았습니다. 위 버튼으로 메일을 보내 두시면 확실합니다.';

  return (
    <div className="page">
      <section className="wrap">
        <div className="block" data-bg="lime">
          <div className="block-in done">
            <Eyebrow>RECEIVED</Eyebrow>
            <h1 className="display-lg">문의가 접수되었습니다.</h1>
            <p className="ticket">{rec.id}</p>
            <p className="body-lg measure">{rec.name} 님, 감사합니다. <b>{rec.email}</b> 으로 1~2 영업일 안에 회신드리겠습니다.</p>
            <div className="hero-cta">
              <a className={mailed ? 'btn-s' : 'btn-p'} href={inquiryMailto(rec, to)}>메일 앱으로 바로 보내기</a>
              <button className="btn-s" type="button" onClick={copy}>{copyLabel}</button>
            </div>
            <p className="form-note" aria-live="polite">{note}</p>
            <Link className="link" href="/">홈으로 돌아가기</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
