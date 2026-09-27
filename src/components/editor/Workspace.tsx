'use client';

/* 작업 화면 — 원본 app.js 의 상태·흐름을 React 로 옮겼다.
   문서 = 서버(계정)가 원본, 브라우저 localStorage 에는 저장 전 사본만 남긴다. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LAST_SITE_PATH_KEY } from '@/components/Nav';
import { AiError, aiJson, aiStream } from '@/lib/ai-client';
import { ERR } from '@/lib/ai-errors';
import { downloadFile, safeName, toHTML, toMarkdown } from '@/lib/export';
import { SEC_TYPES, uid, type Brief, type Manual, type ManualSummary, type RefineId, type Section } from '@/lib/manual';
import { AiPanel, type Tab } from './AiPanel';
import { useConfirm } from './ConfirmModal';
import { DocHead } from './DocHead';
import type { Finding } from './Findings';
import { SectionList, type Mode } from './SectionList';

export type Flash = 'new' | 'deleted' | null;

const BACKUP = (id: string) => `modu/backup/${id}`;
const timeStr = () => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
const narrow = () => window.matchMedia('(max-width: 1180px)').matches;

/** 저장·AI 요청에 보내는 부분 */
const toInput = (d: Manual) => ({
  title: d.title, kind: d.kind, code: d.code, rev: d.rev, effectiveDate: d.effectiveDate,
  owner: d.owner, approver: d.approver, brief: d.brief, sections: d.sections,
});

interface Backup { doc: Manual; base: number }
function readBackup(id: string): Backup | null {
  try { return JSON.parse(localStorage.getItem(BACKUP(id)) || 'null'); } catch { return null; }
}
function writeBackup(d: Manual, base: number) {
  try { localStorage.setItem(BACKUP(d.id), JSON.stringify({ doc: d, base })); } catch { /* 용량 초과 등 */ }
}
function dropBackup(id: string) {
  try { localStorage.removeItem(BACKUP(id)); } catch { /* 저장 불가 */ }
}

export function Workspace({ initialDocs, initialManual, flash }: {
  initialDocs: ManualSummary[];
  initialManual: Manual;
  flash: Flash;
}) {
  const router = useRouter();

  /* ── 문서 상태 ─────────────────────────────────────────── */
  const [doc, setDoc] = useState(initialManual);
  const docRef = useRef(initialManual);
  const [docs, setDocs] = useState(initialDocs);
  const [mode, setMode] = useState<Mode>('edit');
  const [selectedId, setSelectedId] = useState<string | null>(initialManual.sections[0]?.id ?? null);

  /* ── 저장 ─────────────────────────────────────────────── */
  const [saveText, setSaveText] = useState('준비됨');
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverAt = useRef(initialManual.updatedAt);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const editSeq = useRef(0);

  /* ── AI ───────────────────────────────────────────────── */
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const ctlRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [aiUsable, setAiUsable] = useState(true);
  const [writingId, setWritingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('brief');
  const [refineAction, setRefineAction] = useState<RefineId | null>(null);
  const [refineNote, setRefineNote] = useState('');
  const [undo, setUndo] = useState<{ secId: string; body: string } | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [reviewed, setReviewed] = useState(false);

  /* ── 크롬 ─────────────────────────────────────────────── */
  const [railOpen, setRailOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const topicRef = useRef<HTMLTextAreaElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const [confirm, confirmModal] = useConfirm();

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3600);
  }, []);

  /* ── 저장 ─────────────────────────────────────────────── */

  const persist = useCallback((opts: { keepalive?: boolean } = {}) => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    const d = docRef.current;
    const seq = editSeq.current;
    writeBackup(d, serverAt.current);

    const run = async () => {
      let res: Response;
      try {
        res = await fetch(`/api/manuals/${d.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toInput(d)),
          keepalive: opts.keepalive,
        });
      } catch {
        setSaving(false); setSaveText('서버 저장 실패 · 이 브라우저에만 보관');
        return;
      }
      if (!res.ok) {
        setSaving(false);
        setSaveText(res.status === 401 ? '로그인 만료 · 이 브라우저에만 보관' : '서버 저장 실패 · 이 브라우저에만 보관');
        return;
      }
      const { updatedAt } = await res.json();
      serverAt.current = updatedAt;
      setDocs(list => list.map(x => x.id === d.id
        ? { ...x, title: d.title, code: d.code, sample: d.sample, sectionCount: d.sections.length, updatedAt }
        : x));
      // 그사이 새로 고친 게 없으면 사본을 지우고 ‘저장됨’
      if (seq === editSeq.current) {
        dropBackup(d.id);
        setSaving(false);
        setSaveText('저장됨 · ' + timeStr());
      }
    };
    saveChain.current = saveChain.current.then(run);
    return saveChain.current;
  }, []);

  const touch = useCallback(() => {
    editSeq.current++;
    setSaving(true); setSaveText('저장 중…');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { persist(); }, 900);
  }, [persist]);

  /** 문서를 바꾸고 자동 저장을 예약한다 */
  const update = useCallback((fn: (d: Manual) => Manual, save = true) => {
    const next = fn(docRef.current);
    docRef.current = next;
    setDoc(next);
    if (save) touch();
  }, [touch]);

  const patchSection = useCallback((id: string, patch: Partial<Section>, save = true) =>
    update(d => ({ ...d, sections: d.sections.map(s => (s.id === id ? { ...s, ...patch } : s)) }), save), [update]);

  /** 예약된 저장을 지금 끝낸다 (문서 전환 전) */
  const flush = useCallback(async () => {
    if (saveTimer.current) await persist();
    else await saveChain.current;
  }, [persist]);

  /* ── 시작 ─────────────────────────────────────────────── */

  useEffect(() => {
    // 서버에 닿지 못했던 변경이 브라우저에 남아 있으면 되살린다
    const b = readBackup(initialManual.id);
    if (b && b.base >= initialManual.updatedAt && JSON.stringify(toInput(b.doc)) !== JSON.stringify(toInput(initialManual))) {
      docRef.current = { ...b.doc, id: initialManual.id };
      setDoc(docRef.current);
      touch();
      toast('저장되지 않았던 변경을 이 브라우저에서 되살렸습니다.');
    } else if (b) {
      dropBackup(initialManual.id);
    }

    if (flash === 'new') {
      setTab('brief');
      toast('새 매뉴얼을 만들었습니다. 브리프를 채우고 목차를 설계하세요.');
    } else if (flash === 'deleted') {
      toast('삭제했습니다.');
    }
    if (flash) router.replace(`/editor/${initialManual.id}`, { scroll: false });
    titleRef.current?.focus({ preventScroll: true });
    // 마운트할 때 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 페이지를 떠날 때 예약된 저장을 마저 보낸다
  useEffect(() => {
    const onUnload = () => { if (saveTimer.current) persist({ keepalive: true }); };
    window.addEventListener('beforeunload', onUnload);
    return () => { window.removeEventListener('beforeunload', onUnload); onUnload(); };
  }, [persist]);

  /* ── 드로어 ───────────────────────────────────────────── */

  const closeDrawers = useCallback(() => { setRailOpen(false); setPanelOpen(false); }, []);
  const openPanel = useCallback((force?: boolean) => {
    if (!narrow()) return;
    setPanelOpen(o => (force === undefined ? !o : force));
    setRailOpen(false);
  }, []);
  const openRail = useCallback(() => { setRailOpen(o => !o); setPanelOpen(false); }, []);

  const switchTab = useCallback((t: Tab) => { setTab(t); openPanel(true); }, [openPanel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeDrawers(); setMenuOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); persist(); }
    };
    const onClick = () => setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [closeDrawers, persist]);

  /* ── 문서 조작 ────────────────────────────────────────── */

  const openDoc = async (id: string) => {
    closeDrawers();
    if (id === doc.id || busyRef.current) return;
    await flush();
    router.push(`/editor/${id}`);
  };

  const newDoc = async () => {
    if (busyRef.current) return;
    await flush();
    const res = await fetch('/api/manuals', { method: 'POST' });
    if (!res.ok) { toast('새 문서를 만들지 못했습니다. 다시 시도하세요.'); return; }
    const { id } = await res.json();
    router.push(`/editor/${id}?flash=new`);
  };

  const deleteDoc = async () => {
    if (busyRef.current) return;
    if (!(await confirm({
      title: `‘${doc.title || '제목 없는 매뉴얼'}’을 문서함에서 삭제할까요?`,
      body: '삭제한 문서는 되살릴 수 없습니다.',
      confirmLabel: '삭제',
    }))) return;
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    await saveChain.current;
    const res = await fetch(`/api/manuals/${doc.id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) { toast('삭제하지 못했습니다. 다시 시도하세요.'); return; }
    dropBackup(doc.id);
    const rest = docs.filter(d => d.id !== doc.id).sort((a, b) => b.updatedAt - a.updatedAt);
    let next = rest[0]?.id;
    if (!next) {
      const r = await fetch('/api/manuals', { method: 'POST' });
      next = r.ok ? (await r.json()).id : undefined;
    }
    router.push(next ? `/editor/${next}?flash=deleted` : '/editor');
  };

  const selectSection = (id: string) => setSelectedId(id);

  const addSection = () => {
    const sec: Section = { id: uid(), title: '새 섹션', type: '개요', body: '', hint: '' };
    update(d => ({ ...d, sections: [...d.sections, sec] }));
    setSelectedId(sec.id);
    requestAnimationFrame(() =>
      document.querySelector<HTMLInputElement>(`.section[data-id="${sec.id}"] .sec-title`)?.focus());
  };

  const moveSection = (id: string, dir: -1 | 1) => update(d => {
    const arr = [...d.sections];
    const i = arr.findIndex(s => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return d;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...d, sections: arr };
  });

  const deleteSection = async (id: string) => {
    const sec = docRef.current.sections.find(s => s.id === id);
    if (sec?.body.trim() && !(await confirm({
      title: `‘${sec.title}’ 섹션을 삭제할까요?`,
      body: '내용도 함께 사라집니다.',
      confirmLabel: '삭제',
    }))) return;
    update(d => ({ ...d, sections: d.sections.filter(s => s.id !== id) }));
    if (selectedId === id) setSelectedId(docRef.current.sections[0]?.id ?? null);
  };

  const cycleType = (id: string) => {
    const sec = docRef.current.sections.find(s => s.id === id);
    if (!sec) return;
    const i = SEC_TYPES.indexOf(sec.type as (typeof SEC_TYPES)[number]);
    patchSection(id, { type: SEC_TYPES[(i + 1) % SEC_TYPES.length] });
  };

  const setBrief = (patch: Partial<Brief>) => update(d => ({ ...d, brief: { ...d.brief, ...patch } }));

  /* ── AI 작업 ──────────────────────────────────────────── */

  const payload = () => {
    const d = docRef.current;
    return { title: d.title, brief: d.brief, sections: d.sections };
  };

  async function withAi(label: string, fn: (signal: AbortSignal) => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true);
    const ctl = new AbortController();
    ctlRef.current = ctl;
    setStatus(label);
    try {
      await fn(ctl.signal);
    } catch (e) {
      const code = e instanceof AiError ? e.code : 'upstream_error';
      if (code === 'not_declared') setAiUsable(false);
      const msg = ERR[code];
      if (msg) toast(msg);
    } finally {
      busyRef.current = false; setBusy(false);
      ctlRef.current = null; setStatus(null);
    }
  }

  const stopAi = () => { ctlRef.current?.abort(); toast('중단했습니다.'); };

  async function runOutline() {
    if (!docRef.current.brief.topic.trim()) {
      toast('어떤 업무에 대한 매뉴얼인지 먼저 적어주세요.');
      topicRef.current?.focus();
      return;
    }
    await withAi('목차를 설계하는 중…', async signal => {
      const { sections: list } = await aiJson<{ sections: { title: string; type: string; hint: string }[] }>(
        '/api/ai/outline', { manual: payload() }, signal);
      if (!Array.isArray(list) || !list.length) { toast('목차를 읽지 못했습니다. 다시 시도하세요.'); return; }
      const sections: Section[] = list.slice(0, 12).map(x => ({
        id: uid(),
        title: String(x?.title || '제목 없음').slice(0, 40),
        type: (SEC_TYPES as readonly string[]).includes(x?.type) ? x.type : '개요',
        body: '',
        hint: String(x?.hint || '').slice(0, 200),
      }));
      update(d => ({ ...d, sections }));
      setSelectedId(sections[0]?.id ?? null);
      toast(`목차 ${sections.length}개를 설계했습니다. 섹션별로 ‘AI 작성’을 누르세요.`);
    });
  }

  async function writeSection(secId: string, signal: AbortSignal) {
    setWritingId(secId);
    patchSection(secId, { body: '' }, false);
    try {
      const text = await aiStream('/api/ai/section', { manual: payload(), sectionId: secId }, signal,
        t => patchSection(secId, { body: t }, false));
      patchSection(secId, { body: text }, false);
    } catch (e) {
      if (e instanceof AiError && e.text) patchSection(secId, { body: e.text }, false);
      throw e;
    } finally {
      setWritingId(null);
      touch();
    }
  }

  const runSection = async (secId: string) => {
    const sec = docRef.current.sections.find(s => s.id === secId);
    if (!sec) return;
    setSelectedId(secId);
    await withAi(`‘${sec.title}’ 작성 중…`, signal => writeSection(secId, signal));
  };

  async function runDraft() {
    const ids = docRef.current.sections.map(s => s.id);
    if (!ids.length) { toast('목차를 먼저 설계하거나 섹션을 추가하세요.'); return; }
    await withAi('전체 초안 작성 중…', async signal => {
      for (let i = 0; i < ids.length; i++) {
        if (signal.aborted) break;
        const sec = docRef.current.sections.find(s => s.id === ids[i]);
        if (!sec) continue;
        setStatus(`전체 초안 ${i + 1}/${ids.length} — ${sec.title}`);
        await writeSection(sec.id, signal);
      }
      if (!signal.aborted) toast('초안을 모두 작성했습니다. 읽기 모드로 한 번 훑어보세요.');
    });
  }

  async function runRefine() {
    const sec = docRef.current.sections.find(s => s.id === selectedId);
    if (!sec) { toast('다듬을 섹션을 문서에서 골라주세요.'); return; }
    if (!sec.body.trim()) { toast('내용이 비어 있습니다. 먼저 본문을 작성하세요.'); return; }
    const note = refineNote.trim();
    if (!refineAction && !note) { toast('다듬을 방향을 고르거나 직접 지시를 적어주세요.'); return; }

    const before = sec.body;
    await withAi(`‘${sec.title}’ 다듬는 중…`, async signal => {
      try {
        const text = await aiStream('/api/ai/refine',
          { manual: payload(), sectionId: sec.id, action: refineAction, note }, signal,
          t => patchSection(sec.id, { body: t }, false));
        patchSection(sec.id, { body: text }, false);
        setUndo({ secId: sec.id, body: before });
      } catch (e) {
        // 다듬다 멈추면 반쪽 본문 대신 원래 본문으로 돌려 둔다
        patchSection(sec.id, { body: before }, false);
        throw e;
      } finally {
        touch();
      }
    });
  }

  const undoRefine = () => {
    if (!undo) return;
    if (docRef.current.sections.some(s => s.id === undo.secId)) {
      patchSection(undo.secId, { body: undo.body });
      toast('다듬기 전으로 되돌렸습니다.');
    }
    setUndo(null);
  };

  async function runReview() {
    if (!docRef.current.sections.some(s => s.body.trim())) { toast('검수할 내용이 없습니다.'); return; }
    await withAi('매뉴얼을 검수하는 중…', async signal => {
      const { findings: list } = await aiJson<{ findings: Finding[] }>('/api/ai/review', { manual: payload() }, signal);
      const f = Array.isArray(list) ? list.slice(0, 10) : [];
      setFindings(f);
      setReviewed(true);
      toast(f.length ? `보완할 점 ${f.length}건을 찾았습니다.` : '눈에 띄는 문제를 찾지 못했습니다.');
    });
  }

  const jumpToFinding = (f: Finding) => {
    const secs = docRef.current.sections;
    const sec = secs.find(s => s.title === f.section) || secs.find(s => String(f.section).includes(s.title));
    if (!sec) { toast('해당 섹션을 찾지 못했습니다.'); return; }
    setSelectedId(sec.id);
    document.querySelector(`.section[data-id="${sec.id}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    switchTab('refine');
    setRefineNote(f.fix || '');
  };

  /* ── 내보내기 ─────────────────────────────────────────── */

  async function copyText(text: string, okMsg?: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg || '클립보드에 복사했습니다.');
      return true;
    } catch {
      toast('복사할 수 없습니다. 파일로 내보내기를 써주세요.');
      return false;
    }
  }

  async function exportAs(kind: 'md' | 'html' | 'copy') {
    setMenuOpen(false);
    const d = docRef.current;
    if (kind === 'copy') { await copyText(toMarkdown(d), '매뉴얼 전문을 복사했습니다.'); return; }
    const data = kind === 'md' ? toMarkdown(d) : toHTML(d);
    const filename = `${safeName(d)}.${kind}`;
    try {
      downloadFile(filename, data, kind === 'md' ? 'text/markdown' : 'text/html');
      toast(`${filename} 저장했습니다.`);
    } catch {
      await copyText(data, '저장하지 못해 전문을 복사했습니다.');
    }
  }

  const backToSite = () => {
    let to = '/';
    try { to = sessionStorage.getItem(LAST_SITE_PATH_KEY) || '/'; } catch { /* 저장 불가 */ }
    router.push(to);
  };

  /* ── 화면 ─────────────────────────────────────────────── */

  const railDocs = docs
    .map(x => (x.id === doc.id ? { ...x, title: doc.title, code: doc.code, sectionCount: doc.sections.length } : x))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="mx">
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">모</span>
            <span className="brand-name">모두의 매뉴얼</span>
          </div>
          <button className="btn ghost" type="button" onClick={backToSite}>← 사이트로</button>

          <div className="topbar-mid">
            <span className={`save-state${saving ? ' is-saving' : ''}`} aria-live="polite">{saveText}</span>
          </div>

          <div className="topbar-actions">
            <button className="btn ghost drawer-only" id="railToggle" type="button" aria-expanded={railOpen}
              onClick={e => { e.stopPropagation(); openRail(); }}>문서함</button>

            <div className="segmented" role="group" aria-label="보기 모드">
              <button className={`seg${mode === 'edit' ? ' is-on' : ''}`} type="button" aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>편집</button>
              <button className={`seg${mode === 'read' ? ' is-on' : ''}`} type="button" aria-pressed={mode === 'read'} onClick={() => setMode('read')}>읽기</button>
            </div>

            <div className="menu-wrap">
              <button className="btn" type="button" aria-haspopup="true" aria-expanded={menuOpen}
                onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}>내보내기</button>
              <div className="menu" hidden={!menuOpen} onClick={e => e.stopPropagation()}>
                <button type="button" onClick={() => exportAs('md')}>Markdown 파일</button>
                <button type="button" onClick={() => exportAs('html')}>HTML 파일</button>
                <button type="button" onClick={() => exportAs('copy')}>전문 복사</button>
              </div>
            </div>

            <button className="btn ghost drawer-only" id="panelToggle" type="button" aria-expanded={panelOpen}
              onClick={e => { e.stopPropagation(); openPanel(); }}>AI 작업대</button>
          </div>
        </header>

        <aside className={`rail${railOpen ? ' is-open' : ''}`} aria-label="문서함">
          <div className="rail-head">
            <h2>문서함</h2>
            <button className="btn sm" type="button" disabled={busy} onClick={newDoc}>+ 새 매뉴얼</button>
          </div>
          <ul className="doc-list">
            {railDocs.map(d => (
              <li key={d.id}>
                <button type="button" className={`doc-item${d.id === doc.id ? ' is-on' : ''}`}
                  aria-current={d.id === doc.id ? 'true' : undefined}
                  title={d.id === doc.id ? '두 번 누르면 삭제합니다' : undefined}
                  onClick={() => openDoc(d.id)} onDoubleClick={() => { if (d.id === doc.id) deleteDoc(); }}>
                  <span className="doc-item-name">{d.title || '제목 없는 매뉴얼'}</span>
                  <span className="doc-item-meta">
                    {d.sample && <span className="tag-sample">예시</span>}
                    <span>{d.code || '미지정'}</span><span>섹션 {d.sectionCount}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="rail-note">계정에 저장됩니다. 어느 기기에서 열어도 같은 문서함입니다.</p>
        </aside>

        <main className="stage" ref={stageRef}>
          <article className="doc">
            <DocHead doc={doc} titleRef={titleRef} onChange={patch => update(d => ({ ...d, ...patch }))} />

            <SectionList sections={doc.sections} mode={mode} selectedId={selectedId} writingId={writingId}
              busy={busy} aiUsable={aiUsable}
              onSelect={selectSection}
              onChange={(id, patch) => patchSection(id, patch)}
              onCycleType={cycleType}
              onWrite={runSection}
              onMove={moveSection}
              onDelete={deleteSection} />

            <div className="doc-foot">
              <button className="btn dashed" type="button" disabled={busy} onClick={addSection}>+ 섹션 추가</button>
            </div>
          </article>
        </main>

        <AiPanel doc={doc} open={panelOpen} tab={tab} onTab={switchTab} onBrief={setBrief}
          busy={busy} aiUsable={aiUsable} status={status} onStop={stopAi}
          onOutline={runOutline} onDraft={runDraft} topicRef={topicRef}
          selectedId={selectedId} refineAction={refineAction} onRefineAction={setRefineAction}
          refineNote={refineNote} onRefineNote={setRefineNote} onRefine={runRefine}
          canUndo={!!undo} onUndo={undoRefine}
          findings={findings} reviewed={reviewed} onReview={runReview} onJump={jumpToFinding} />

        <div className="scrim" hidden={!railOpen && !panelOpen} onClick={closeDrawers} />
        {confirmModal}
        <div className="toast" role="status" aria-live="polite" hidden={!toastMsg}>{toastMsg}</div>
      </div>
    </div>
  );
}
