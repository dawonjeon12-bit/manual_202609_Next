import { z } from 'zod';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { FALLBACK, MODEL, codeOf, errorResponse, guardAi } from '@/lib/anthropic';
import { reviewInput } from '@/lib/ai-input';
import { reviewPrompt } from '@/lib/prompts';
import { badRequest, json, readJson } from '@/lib/http';

export const runtime = 'nodejs';
export const maxDuration = 300;

const Review = z.object({
  findings: z.array(z.object({
    severity: z.enum(['높음', '보통', '낮음']),
    section: z.string(),
    issue: z.string(),
    fix: z.string(),
  })),
});

export async function POST(req: Request) {
  const input = reviewInput.safeParse(await readJson(req));
  if (!input.success) return badRequest();
  const g = await guardAi();
  if (g instanceof Response) return g;

  try {
    // 원본의 modelTier:'complex' — 검수는 가장 판단이 많이 드는 작업이라 effort 를 명시한다.
    const msg = await g.anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high', format: betaZodOutputFormat(Review) },
      ...FALLBACK,
      messages: [{ role: 'user', content: reviewPrompt(input.data.manual) }],
    }, { signal: req.signal });

    if (msg.stop_reason === 'refusal') return errorResponse('refused');
    const list = msg.parsed_output?.findings;
    if (!list) return errorResponse('invalid_json');
    return json({ findings: list.slice(0, 10) });
  } catch (e) {
    return errorResponse(codeOf(e));
  }
}
