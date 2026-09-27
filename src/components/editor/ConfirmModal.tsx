'use client';

/* 브라우저 confirm() 대신 쓰는 확인 모달.
   AutoAnimate 가 부모(.modal-host) 안에서 자식이 생기고 사라질 때 애니메이션을 붙인다.
   감속 설정(prefers-reduced-motion)이면 AutoAnimate 가 알아서 애니메이션을 끈다. */
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface Pending extends ConfirmOptions { resolve: (ok: boolean) => void }

/** const [confirm, modal] = useConfirm();  if (!(await confirm({ title }))) return; */
export function useConfirm(): [(o: ConfirmOptions) => Promise<boolean>, React.ReactNode] {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback((o: ConfirmOptions) =>
    new Promise<boolean>(resolve => setPending({ ...o, resolve })), []);

  const close = useCallback((ok: boolean) => {
    setPending(p => { p?.resolve(ok); return null; });
  }, []);

  return [confirm, <ConfirmModal key="confirm-modal" pending={pending} onClose={close} />];
}

function ConfirmModal({ pending, onClose }: { pending: Pending | null; onClose: (ok: boolean) => void }) {
  const [host] = useAutoAnimate<HTMLDivElement>({ duration: 180, easing: 'ease-out' });
  const cancelRef = useRef<HTMLButtonElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pending) return;
    const prev = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus(); // 되돌릴 수 없는 동작이라 기본 초점은 ‘취소’
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(false); }
      if (e.key === 'Tab') { // 두 버튼 사이에서만 초점이 돈다
        e.preventDefault();
        (document.activeElement === cancelRef.current ? okRef : cancelRef).current?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); prev?.focus?.(); };
  }, [pending, onClose]);

  return (
    <div ref={host} className="modal-host">
      {pending && (
        <div className="modal-scrim" onClick={() => onClose(false)}>
          <div className="modal" role="alertdialog" aria-modal="true"
            aria-labelledby="modal-title" aria-describedby={pending.body ? 'modal-body' : undefined}
            onClick={e => e.stopPropagation()}>
            <h2 className="modal-title" id="modal-title">{pending.title}</h2>
            {pending.body && <p className="modal-body" id="modal-body">{pending.body}</p>}
            <div className="modal-actions">
              <button ref={cancelRef} className="btn" type="button" onClick={() => onClose(false)}>
                {pending.cancelLabel || '취소'}
              </button>
              <button ref={okRef} className="btn primary" type="button" onClick={() => onClose(true)}>
                {pending.confirmLabel || '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
