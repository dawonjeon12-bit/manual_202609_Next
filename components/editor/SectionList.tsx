'use client';

import { useLayoutEffect, useRef } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import type { Section } from '@/lib/manual';

export type Mode = 'edit' | 'read';

interface ItemProps {
  sec: Section;
  idx: number;
  mode: Mode;
  active: boolean;
  writing: boolean;
  busy: boolean;
  aiUsable: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Section>) => void;
  onCycleType: () => void;
  onWrite: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}

const autosize = (ta: HTMLTextAreaElement) => { ta.style.height = 'auto'; ta.style.height = Math.max(60, ta.scrollHeight) + 'px'; };

function SectionItem(p: ItemProps) {
  const { sec } = p;
  const taRef = useRef<HTMLTextAreaElement>(null);
  const elRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => { if (taRef.current) autosize(taRef.current); }, [sec.body, p.mode]);
  useLayoutEffect(() => {
    if (p.writing) elRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [p.writing]);

  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  return (
    <section ref={elRef} className={`section${p.active ? ' is-active' : ''}${p.writing ? ' is-writing' : ''}`}
      data-id={sec.id} data-sectype={sec.type} onClick={p.onSelect}>
      <div className="sec-head">
        <span className="sec-num">{String(p.idx + 1).padStart(2, '0')}</span>
        <input className="sec-title" aria-label="섹션 제목" placeholder="섹션 제목" value={sec.title}
          onChange={e => p.onChange({ title: e.target.value })} onFocus={p.onSelect} />
        <span className="sec-tools">
          <button className="sec-type" type="button" data-type={sec.type} title="섹션 종류 바꾸기" onClick={stop(p.onCycleType)}>{sec.type}</button>
          <button className="icon-btn write" type="button" title="이 섹션 본문을 Claude가 작성"
            disabled={p.busy || !p.aiUsable} onClick={stop(p.onWrite)}>AI 작성</button>
          <button className="icon-btn" type="button" title="위로" aria-label="위로" disabled={p.busy} onClick={stop(() => p.onMove(-1))}>↑</button>
          <button className="icon-btn" type="button" title="아래로" aria-label="아래로" disabled={p.busy} onClick={stop(() => p.onMove(1))}>↓</button>
          <button className="icon-btn" type="button" title="섹션 삭제" aria-label="섹션 삭제" disabled={p.busy} onClick={stop(p.onDelete)}>✕</button>
        </span>
      </div>
      <div className="sec-content">
        {p.mode === 'edit' ? (
          <textarea ref={taRef} className="sec-body" value={sec.body}
            placeholder={sec.hint ? `${sec.hint}  —  직접 쓰거나 ‘AI 작성’을 누르세요.` : '내용을 쓰거나 ‘AI 작성’을 누르세요.'}
            onChange={e => { p.onChange({ body: e.target.value }); autosize(e.target); }} onFocus={p.onSelect} />
        ) : (
          <div className="prose" data-type={sec.type}
            dangerouslySetInnerHTML={{ __html: sec.body.trim() ? renderMarkdown(sec.body) : '<p class="empty-body">비어 있음</p>' }} />
        )}
      </div>
    </section>
  );
}

/** 섹션 추가/삭제/순서/종류/제목/본문 */
export function SectionList(props: Omit<ItemProps, 'sec' | 'idx' | 'active' | 'writing' | 'onSelect' | 'onChange' | 'onCycleType' | 'onWrite' | 'onMove' | 'onDelete'> & {
  sections: Section[];
  selectedId: string | null;
  writingId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<Section>) => void;
  onCycleType: (id: string) => void;
  onWrite: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  if (!props.sections.length) {
    return (
      <div className="sections">
        <div className="section"><p className="prose"><span className="empty-body">아직 섹션이 없습니다. 오른쪽 브리프를 채우고 ‘목차 설계’를 누르거나, 아래에서 섹션을 직접 추가하세요.</span></p></div>
      </div>
    );
  }
  return (
    <div className="sections">
      {props.sections.map((sec, idx) => (
        <SectionItem key={sec.id} sec={sec} idx={idx} mode={props.mode} busy={props.busy} aiUsable={props.aiUsable}
          active={sec.id === props.selectedId} writing={sec.id === props.writingId}
          onSelect={() => props.onSelect(sec.id)}
          onChange={patch => props.onChange(sec.id, patch)}
          onCycleType={() => props.onCycleType(sec.id)}
          onWrite={() => props.onWrite(sec.id)}
          onMove={dir => props.onMove(sec.id, dir)}
          onDelete={() => props.onDelete(sec.id)} />
      ))}
    </div>
  );
}
