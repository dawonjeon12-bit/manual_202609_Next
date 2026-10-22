'use client';

import type { Brief, Manual, RefineId } from '@/lib/manual';
import { DEPTHS, REFINE, TONES } from '@/lib/manual';
import { Findings, type Finding } from './Findings';

export type Tab = 'brief' | 'refine' | 'review';

interface Props {
  doc: Manual;
  open: boolean;
  tab: Tab;
  onTab: (t: Tab) => void;
  onBrief: (patch: Partial<Brief>) => void;
  busy: boolean;
  aiUsable: boolean;
  status: string | null;
  onStop: () => void;
  // 브리프
  onOutline: () => void;
  onDraft: () => void;
  topicRef: React.Ref<HTMLTextAreaElement>;
  // 다듬기
  selectedId: string | null;
  refineAction: RefineId | null;
  onRefineAction: (id: RefineId | null) => void;
  refineNote: string;
  onRefineNote: (v: string) => void;
  onRefine: () => void;
  canUndo: boolean;
  onUndo: () => void;
  // 검수
  findings: Finding[];
  reviewed: boolean;
  onReview: () => void;
  onJump: (f: Finding) => void;
}

const TABS: [Tab, string][] = [['brief', '브리프'], ['refine', '다듬기'], ['review', '검수']];

export function AiPanel({ topicRef, ...p }: Props) {
  const b = p.doc.brief;
  const idx = p.doc.sections.findIndex(s => s.id === p.selectedId);
  const target = idx >= 0 ? p.doc.sections[idx] : null;
  const canRefine = !!p.selectedId && (!!p.refineAction || !!p.refineNote.trim());
  const aiOff = p.busy || !p.aiUsable;

  return (
    <aside className={`panel${p.open ? ' is-open' : ''}`} id="panel" aria-label="AI 작업대">
      <div className="panel-tabs" role="tablist">
        {TABS.map(([t, label]) => (
          <button key={t} className={`ptab${p.tab === t ? ' is-on' : ''}`} id={`tab-${t}`} role="tab" type="button"
            aria-selected={p.tab === t} aria-controls={`pane-${t}`} onClick={() => p.onTab(t)}>{label}</button>
        ))}
      </div>

      <div className="panel-body">
        <section className="pane" id="pane-brief" role="tabpanel" aria-labelledby="tab-brief" hidden={p.tab !== 'brief'}>
          <p className="pane-lead">무엇에 대한 매뉴얼인지 알려주면, 내용에 맞는 목차부터 설계합니다.</p>

          <div className="field">
            <label htmlFor="bTopic">어떤 업무인가요</label>
            <textarea ref={topicRef} id="bTopic" rows={3} placeholder="예) 브랜드 SNS 콘텐츠를 기획하고 발행하기까지의 전 과정"
              value={b.topic} onChange={e => p.onBrief({ topic: e.target.value })} />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="bAudience">읽는 사람</label>
              <input id="bAudience" placeholder="예) 입사 1개월 차 에디터" value={b.audience} onChange={e => p.onBrief({ audience: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="bPurpose">쓰는 목적</label>
              <input id="bPurpose" placeholder="예) 인수인계 없이도 혼자 처리" value={b.purpose} onChange={e => p.onBrief({ purpose: e.target.value })} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="bTone">문체</label>
              <select id="bTone" value={b.tone} onChange={e => p.onBrief({ tone: e.target.value })}>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="bDepth">상세도</label>
              <select id="bDepth" value={b.depth} onChange={e => p.onBrief({ depth: e.target.value })}>
                {DEPTHS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="bRaw">참고 원문 <span className="hint">메모, 기존 문서, 슬랙 대화 무엇이든</span></label>
            <textarea id="bRaw" rows={6} placeholder="정리되지 않은 메모를 그대로 붙여넣어도 됩니다."
              value={b.raw} onChange={e => p.onBrief({ raw: e.target.value })} />
          </div>

          <div className="pane-actions">
            <button className="btn primary" type="button" disabled={aiOff} onClick={p.onOutline}>목차 설계</button>
            <button className="btn" type="button" disabled={aiOff} onClick={p.onDraft}>전체 초안 작성</button>
          </div>
          <p className="pane-foot">‘전체 초안 작성’은 섹션 수만큼 Claude를 호출합니다. 목차를 먼저 확인한 뒤 실행하세요.</p>
          {!p.aiUsable && <p className="pane-foot">이 화면에서는 Claude를 호출할 수 없습니다. 문서 작성과 저장, 내보내기는 그대로 쓸 수 있습니다.</p>}
        </section>

        <section className="pane" id="pane-refine" role="tabpanel" aria-labelledby="tab-refine" hidden={p.tab !== 'refine'}>
          <p className="pane-lead">문서에서 섹션을 하나 고른 뒤 다듬을 방향을 선택하세요.</p>
          <div className="target-card">
            {target ? (
              <>
                <span className="target-num">{String(idx + 1).padStart(2, '0')} · {target.type}</span>
                <span className="target-name">{target.title || '제목 없음'}</span>
              </>
            ) : <span className="target-empty">선택된 섹션 없음 — 문서에서 섹션을 클릭하세요.</span>}
          </div>

          <div className="chips" role="group" aria-label="다듬기 방향">
            {REFINE.map(r => (
              <button key={r.id} type="button" className={`chip${p.refineAction === r.id ? ' is-on' : ''}`}
                aria-pressed={p.refineAction === r.id}
                onClick={() => p.onRefineAction(p.refineAction === r.id ? null : r.id)}>{r.label}</button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="refineNote">직접 지시 <span className="hint">선택</span></label>
            <input id="refineNote" placeholder="예) 승인 단계를 2단계로 줄여서" value={p.refineNote}
              onChange={e => p.onRefineNote(e.target.value)} />
          </div>

          <div className="pane-actions">
            <button className="btn primary" type="button" disabled={aiOff || !canRefine} onClick={p.onRefine}>다듬기 실행</button>
            <button className="btn" type="button" disabled={p.busy || !p.canUndo} onClick={p.onUndo}>되돌리기</button>
          </div>
        </section>

        <section className="pane" id="pane-review" role="tabpanel" aria-labelledby="tab-review" hidden={p.tab !== 'review'}>
          <p className="pane-lead">읽는 사람 입장에서 이 매뉴얼대로 일을 할 수 있는지 점검합니다.</p>
          <div className="pane-actions">
            <button className="btn primary" type="button" disabled={aiOff} onClick={p.onReview}>검수 실행</button>
          </div>
          <Findings findings={p.findings} reviewed={p.reviewed} onJump={p.onJump} />
        </section>
      </div>

      <div className="panel-status" hidden={!p.status}>
        <span className="pulse" aria-hidden="true" />
        <span className="status-text" aria-live="polite">{p.status}</span>
        <button className="btn sm ghost" type="button" onClick={p.onStop}>중단</button>
      </div>
    </aside>
  );
}
