/* 브라우저에서 /api/ai/* 를 부르는 쪽. 서버 오류 코드를 ERR 맵의 코드로 되돌려 던진다. */
import { isAiErrorCode, STREAM_ERROR_MARK, type AiErrorCode } from './ai-errors';

export class AiError extends Error {
  constructor(public code: AiErrorCode, public text = '') {
    super(code);
  }
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

async function post(path: string, body: unknown, signal: AbortSignal): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    throw new AiError(isAbort(e) ? 'cancelled' : 'upstream_error');
  }
  if (!res.ok) {
    let code: unknown;
    try { code = (await res.json())?.error; } catch { /* 본문 없음 */ }
    throw new AiError(isAiErrorCode(code) ? code : res.status === 401 ? 'session_expired' : 'upstream_error');
  }
  return res;
}

/** 구조화 출력 (목차·검수) */
export async function aiJson<T>(path: string, body: unknown, signal: AbortSignal): Promise<T> {
  const res = await post(path, body, signal);
  try { return (await res.json()) as T; } catch (e) {
    throw new AiError(isAbort(e) ? 'cancelled' : 'invalid_json');
  }
}

/**
 * 스트리밍 본문 (섹션 작성·다듬기). onText 는 지금까지 받은 전체 본문으로 불린다.
 * 실패·중단하면 쓰던 데까지를 AiError.text 에 담아 던진다 — ‘쓰던 데까지는 남습니다’.
 */
export async function aiStream(
  path: string, body: unknown, signal: AbortSignal, onText: (text: string) => void,
): Promise<string> {
  const res = await post(path, body, signal);
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let raw = '';
  const textOf = () => { const i = raw.indexOf(STREAM_ERROR_MARK); return i < 0 ? raw : raw.slice(0, i); };

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      raw += dec.decode(value, { stream: true });
      onText(textOf());
    }
    raw += dec.decode();
  } catch (e) {
    throw new AiError(isAbort(e) || signal.aborted ? 'cancelled' : 'upstream_error', textOf());
  }

  const i = raw.indexOf(STREAM_ERROR_MARK);
  if (i >= 0) {
    const code = raw.slice(i + 1).trim();
    throw new AiError(isAiErrorCode(code) ? code : 'upstream_error', raw.slice(0, i));
  }
  if (signal.aborted) throw new AiError('cancelled', raw);
  return raw;
}
