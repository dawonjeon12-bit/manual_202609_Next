import { currentUser } from '@/lib/session';
import { createManual, listManuals, manualInputSchema } from '@/lib/manuals';
import { blankDoc } from '@/lib/manual';
import { badRequest, json, readJson, unauthorized } from '@/lib/http';

export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  return json({ manuals: await listManuals(user.id) });
}

/** 본문이 비어 있으면 빈 문서를 만든다 (‘+ 새 매뉴얼’). */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const body = await readJson(req);
  const parsed = manualInputSchema.safeParse(body ?? blankDoc());
  if (!parsed.success) return badRequest();
  const id = await createManual(user.id, parsed.data);
  return json({ id }, 201);
}
