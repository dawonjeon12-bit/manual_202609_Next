import { currentUser } from '@/lib/session';
import { deleteManual, getManual, manualInputSchema, updateManual } from '@/lib/manuals';
import { badRequest, json, notFound, readJson, unauthorized } from '@/lib/http';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const manual = await getManual(user.id, (await params).id);
  return manual ? json({ manual }) : notFound();
}

/** 자동 저장 — 문서 전체를 보낸다. */
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return unauthorized();
  const parsed = manualInputSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest();
  const updatedAt = await updateManual(user.id, (await params).id, parsed.data);
  return updatedAt === null ? notFound() : json({ updatedAt });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return unauthorized();
  return (await deleteManual(user.id, (await params).id)) ? json({ ok: true }) : notFound();
}
