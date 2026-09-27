import { z } from 'zod';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { FALLBACK, MODEL, codeOf, errorResponse, guardAi } from '@/lib/anthropic';
import { outlineInput } from '@/lib/ai-input';
import { outlinePrompt } from '@/lib/prompts';
import { SEC_TYPES } from '@/lib/manual';
import { badRequest, json, readJson } from '@/lib/http';

export const runtime = 'nodejs';
export const maxDuration = 300;

const Outline = z.object({
  sections: z.array(z.object({ title: z.string(), type: z.enum(SEC_TYPES), hint: z.string() })),
});

export async function POST(req: Request) {
  const input = outlineInput.safeParse(await readJson(req));
  if (!input.success) return badRequest();
  const g = await guardAi();
  if (g instanceof Response) return g;

  try {
    const msg = await g.anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { format: betaZodOutputFormat(Outline) },
      ...FALLBACK,
      messages: [{ role: 'user', content: outlinePrompt(input.data.manual) }],
    }, { signal: req.signal });

    if (msg.stop_reason === 'refusal') return errorResponse('refused');
    const list = msg.parsed_output?.sections;
    if (!list) return errorResponse('invalid_json');
    return json({ sections: list });
  } catch (e) {
    return errorResponse(codeOf(e));
  }
}
