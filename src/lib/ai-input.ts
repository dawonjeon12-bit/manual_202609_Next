import { z } from 'zod';
import { REFINE } from './manual';

const str = (max: number) => z.string().max(max);

const briefSchema = z.object({
  topic: str(4000), audience: str(400), purpose: str(400),
  tone: str(40), depth: str(40), raw: str(60000),
});

const sectionSchema = z.object({
  id: str(64).min(1),
  type: str(20),
  title: str(200),
  body: str(200000),
  hint: str(400),
});

/** AI 라우트가 받는 문서 — 저장 전 상태 그대로 (클라이언트 편집본) */
export const aiManualSchema = z.object({
  title: z.string().max(200),
  brief: briefSchema,
  sections: z.array(sectionSchema).max(60),
});

export const outlineInput = z.object({ manual: aiManualSchema });
export const sectionInput = z.object({ manual: aiManualSchema, sectionId: z.string() });
export const refineInput = z.object({
  manual: aiManualSchema,
  sectionId: z.string(),
  action: z.enum(REFINE.map(r => r.id) as [string, ...string[]]).nullable(),
  note: z.string().max(2000),
});
export const reviewInput = z.object({ manual: aiManualSchema });
