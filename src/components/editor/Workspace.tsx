'use client';

/* 작업 화면 — 원본 app.js 의 상태·흐름을 React 로 옮겼다.
   문서함은 이 브라우저(localStorage)에만 저장한다 (src/lib/local-store.ts). */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LAST_SITE_PATH_KEY } from '@/components/Nav';
import { AiError, aiJson, aiStream } from '@/lib/ai-client';
import { ERR } from '@/lib/ai-errors';
import { downloadFile, safeName, toHTML, toMarkdown } from '@/lib/export';
import { initialDocs, newManual, saveDocs } from '@/lib/local-store';
import { SEC_TYPES, uid, type Brief, type Manual, type RefineId, type Section } from '@/lib/manual';
import { AiPanel, type Tab } from './AiPanel';
import { useConfirm } from './ConfirmModal';
import { DocHead } from './DocHead';
import type { Finding } from './Findings';
import { SectionList, type Mode } from './SectionList';

const timeStr = () => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
const narrow = () => window.matchMedia('(max-width: 1180px)').matches;

/** 브라우저에서만 렌더링된다 (src/app/editor/EditorClient.tsx — ssr:false) */
export function Workspace() {
  const router = useRouter();

  /* ── 문서 상태 ─────────────────────────────────────────── */
  const [docs, setDocs] = useState<Manual[]>(initialDocs);
  const docsRef = useRef(docs);
  const [doc, setDoc] = useState<Manual>(() => docs[0]);
  const docRef = useRef(doc);
  const [mode, setMode] = useState<Mode>('edit');
  const [selectedId, setSelectedId] = useState<string | null>(() => doc.sections[0]?.id ?? null);

  /* ── 저장 ─────────────────────────────────────────────── */
  const [saveText, setSaveText] = useState('준비됨');
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const commitDocs = useCallback((list: Manual[]) => {
    docsRef.current = list;
    setDocs(list);
    return saveDocs(list);
  }, []);

  const persist = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    const d = docRef.current;
    const list = docsRef.current.some(x => x.id === d.id)
      ? docsRef.current.map(x => (x.id === d.id ? d : x))
      : [d, ...docsRef.current];
    setSaving(false);
    setSaveText(commitDocs(list) ? '저장됨 · ' + timeStr() : '저장 실패 · 브라우저 저장 공간을 확인하세요');
  }, [commitDocs]);

  const touch = useCallback(() => {
    docRef.current = { ...docRef.current, updatedAt: Date.now() };
    setSaving(true); setSaveText('저장 중…');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(persist, 900);
  }, [persist]);

  /** 문서를 바꾸고 자동 저장을 예약한다 */
  const update = useCallback((fn: (d: Manual) => Manual, save = true) => {
    docRef.current = fn(docRef.current);
    if (save) touch();
    setDoc(docRef.current);
  }, [touch]);

  const patchSection = useCallback((id: string, patch: Partial<Section>, save = true) =>
    update(d => ({ ...d, sections: d.sections.map(s => (s.id === id ? { ...s, ...patch } : s)) }), save), [update]);

  /** 예약된 저장을 지금 끝낸다 (문서 전환 전) */
  const flush = useCallback(() => { if (saveTimer.current) persist(); }, [persist]);

  /* ── 시작 ─────────────────────────────────────────────── */

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  // 페이지를 떠날 때 예약된 저장을 마저 한다
  useEffect(() => {
    window.addEventListener('beforeunload', flush);
    return () => { window.removeEventListener('beforeunload', flush); flush(); };
  }, [flush]);

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

  /** 문서를 열고 문서마다 따로인 상태를 처음으로 돌린다 (원본 openDoc) */
  const show = (d: Manual) => {
    docRef.current = d;
    setDoc(d);
    setSelectedId(d.sections[0]?.id ?? null);
    setFindings([]); setReviewed(false); setUndo(null);
    if (stageRef.current) stageRef.current.scrollTop = 0;
  };

  const openDoc = (id: string) => {
    closeDrawers();
    if (id === doc.id || busyRef.current) return;
    flush();
    const d = docsRef.current.find(x => x.id === id);
    if (d) show(d);
  };

  const newDoc = () => {
    if (busyRef.current) return;
    flush();
    const d = newManual();
    commitDocs([d, ...docsRef.current]);
    show(d);
    setSaveText('저장됨 · ' + timeStr());
    switchTab('brief');
    requestAnimationFrame(() => titleRef.current?.focus());
    toast('새 매뉴얼을 만들었습니다. 브리프를 채우고 목차를 설계하세요.');
  };

  const deleteDoc = async () => {
    if (busyRef.current) return;
    if (!(await confirm({
      title: `‘${doc.title || '제목 없는 매뉴얼'}’을 문서함에서 삭제할까요?`,
      body: '삭제한 문서는 되살릴 수 없습니다.',
      confirmLabel: '삭제',
    }))) return;
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    let rest = docsRef.current.filter(d => d.id !== doc.id);
    if (!rest.length) rest = [newManual()];
    commitDocs(rest);
    show(rest[0]);
    setSaving(false); setSaveText('저장됨 · ' + timeStr());
    toast('삭제했습니다.');
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

  // 문서함은 편집 중인 문서를 실시간으로 반영해 최근 순으로
  const railDocs = docs
    .map(x => (x.id === doc.id ? doc : x))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

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
                    <span>{d.code || '미지정'}</span><span>섹션 {d.sections.length}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="rail-note">이 브라우저에만 저장됩니다. 다른 기기에서는 보이지 않습니다.</p>
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
