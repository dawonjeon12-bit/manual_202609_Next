/* Anthropic 호출 공통부 — 서버 전용. ANTHROPIC_API_KEY 는 이 파일 밖으로 나가지 않는다. */
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { BetaMessageStreamParams } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { AnthropicBeta } from '@anthropic-ai/sdk/resources/beta/beta';
import { STREAM_ERROR_MARK, type AiErrorCode } from './ai-errors';
import { json } from './http';

/** plan §4.4 — 비용 때문에 바꿀 때는 ANTHROPIC_MODEL 로 (claude-sonnet-5 등). */
export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';

/** 안전 분류기가 거절하면 서버에서 Anthropic 권장 모델로 다시 돌린다. */
export const FALLBACK: { betas: AnthropicBeta[]; fallbacks: 'default' } = {
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
};

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

export const aiError = (code: AiErrorCode, status: number) => json({ error: code }, status);

/** 키 설정을 확인한다. 로그인 없이 쓰므로 사용자별 사용량 상한은 없다. */
export async function guardAi(): Promise<{ anthropic: Anthropic } | Response> {
  const anthropic = getClient();
  if (!anthropic) return aiError('not_declared', 503);
  return { anthropic };
}

/** SDK 예외 → 원본 ERR 맵의 코드 */
export function codeOf(e: unknown): AiErrorCode {
  if (e instanceof Anthropic.APIUserAbortError) return 'cancelled';
  if (e instanceof Anthropic.RateLimitError) return 'rate_limited';
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return 'not_declared';
  if (e instanceof Anthropic.APIError && e.status === 413) return 'prompt_too_large';
  if (e instanceof Anthropic.BadRequestError && /too long|too large/i.test(e.message)) return 'prompt_too_large';
  if (e instanceof Anthropic.InternalServerError || e instanceof Anthropic.APIConnectionError) return 'upstream_error';
  if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
  return 'upstream_error';
}

const STATUS: Partial<Record<AiErrorCode, number>> = {
  bad_request: 400, rate_limited: 429, prompt_too_large: 413, not_declared: 503, refused: 422,
  empty_completion: 422, invalid_json: 502, cancelled: 499,
};
export const errorResponse = (code: AiErrorCode) => aiError(code, STATUS[code] ?? 502);

/**
 * 텍스트 델타만 흘려보내는 스트림. 본문이 끝난 뒤 문제가 있었으면
 * STREAM_ERROR_MARK + 오류 코드를 덧붙인다 (HTTP 상태는 이미 200 으로 나갔으므로).
 * 클라이언트가 연결을 끊으면 req.signal 이 SDK 요청을 끊어 과금도 멈춘다.
 */
export function streamText(
  anthropic: Anthropic,
  params: Omit<BetaMessageStreamParams, 'model' | 'max_tokens' | 'betas' | 'fallbacks'>,
  signal: AbortSignal,
): Response {
  const stream = anthropic.beta.messages.stream(
    { model: MODEL, max_tokens: 64000, thinking: { type: 'adaptive' }, ...FALLBACK, ...params },
    { signal },
  );
  const enc = new TextEncoder();

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        let wrote = false;
        try {
          for await (const ev of stream) {
            if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
              wrote = true;
              controller.enqueue(enc.encode(ev.delta.text));
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === 'refusal') controller.enqueue(enc.encode(STREAM_ERROR_MARK + 'refused'));
          else if (!wrote) controller.enqueue(enc.encode(STREAM_ERROR_MARK + 'empty_completion'));
        } catch (e) {
          const code = codeOf(e);
          if (code !== 'cancelled') controller.enqueue(enc.encode(STREAM_ERROR_MARK + code));
        } finally {
          try { controller.close(); } catch { /* 이미 닫힘 */ }
        }
      },
      cancel() { stream.abort(); },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}
