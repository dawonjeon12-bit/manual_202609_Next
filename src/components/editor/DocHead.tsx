'use client';

import type { Manual } from '@/lib/manual';

type Meta = 'code' | 'rev' | 'effectiveDate' | 'owner' | 'approver';
const META: { key: Meta; id: string; label: string; ph: string }[] = [
  { key: 'code',          id: 'metaCode',     label: '문서번호', ph: 'ASC-OPS-001' },
  { key: 'rev',           id: 'metaRev',      label: '개정',     ph: '1.0' },
  { key: 'effectiveDate', id: 'metaDate',     label: '시행일',   ph: '2026-09-12' },
  { key: 'owner',         id: 'metaOwner',    label: '관리부서', ph: '콘텐츠운영팀' },
  { key: 'approver',      id: 'metaApprover', label: '승인',     ph: '팀장' },
];

/** 표제부 7필드 — 종류·제목 + 문서번호·개정·시행일·관리부서·승인 */
export function DocHead({ doc, onChange, titleRef }: {
  doc: Manual;
  onChange: (patch: Partial<Manual>) => void;
  titleRef: React.Ref<HTMLInputElement>;
}) {
  return (
    <div className="doc-head">
      <div className="doc-head-top">
        <label className="doc-kind">
          <span className="sr-only">문서 종류</span>
          <input value={doc.kind} maxLength={20} aria-label="문서 종류" onChange={e => onChange({ kind: e.target.value })} />
        </label>
        <span className="rev-seal">Rev. {doc.rev || '1.0'}</span>
      </div>

      <input ref={titleRef} className="doc-title" placeholder="매뉴얼 제목을 입력하세요" aria-label="매뉴얼 제목"
        value={doc.title} onChange={e => onChange({ title: e.target.value })} />

      <dl className="meta-grid">
        {META.map(m => (
          <div key={m.key} className="meta-cell">
            <dt><label htmlFor={m.id}>{m.label}</label></dt>
            <dd><input id={m.id} placeholder={m.ph} value={doc[m.key]} onChange={e => onChange({ [m.key]: e.target.value })} /></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
