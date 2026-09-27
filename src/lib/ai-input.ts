import { z } from 'zod';
import { briefSchema, sectionSchema } from './manuals';
import { REFINE } from './manual';

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
