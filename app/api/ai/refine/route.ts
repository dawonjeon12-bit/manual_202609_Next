import { errorResponse, guardAi, streamText } from '@/lib/anthropic';
import { refineInput } from '@/lib/ai-input';
import { refinePrompt } from '@/lib/prompts';
import type { RefineId } from '@/lib/manual';
import { badRequest, readJson } from '@/lib/http';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request) {
  const input = refineInput.safeParse(await readJson(req));
  if (!input.success) return badRequest();
  const { manual, sectionId, action, note } = input.data;
  const sec = manual.sections.find(s => s.id === sectionId);
  if (!sec || !sec.body.trim() || (!action && !note.trim())) return errorResponse('bad_request');
  const g = await guardAi();
  if (g instanceof Response) return g;

  return streamText(g.anthropic, {
    messages: [{ role: 'user', content: refinePrompt(manual, sec, action as RefineId | null, note.trim()) }],
  }, req.signal);
}
