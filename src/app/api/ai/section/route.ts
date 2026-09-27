import { errorResponse, guardAi, streamText } from '@/lib/anthropic';
import { sectionInput } from '@/lib/ai-input';
import { sectionPrompt } from '@/lib/prompts';
import { badRequest, readJson } from '@/lib/http';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request) {
  const input = sectionInput.safeParse(await readJson(req));
  if (!input.success) return badRequest();
  const { manual, sectionId } = input.data;
  const sec = manual.sections.find(s => s.id === sectionId);
  if (!sec) return errorResponse('bad_request');
  const g = await guardAi();
  if (g instanceof Response) return g;

  // 브리프·목차(prefix)는 전체 초안 동안 섹션마다 같다 → 캐시해서 반복 입력 비용을 줄인다.
  const { prefix, rest } = sectionPrompt(manual, sec);
  return streamText(g.anthropic, {
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prefix, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: rest },
      ],
    }],
  }, req.signal);
}
