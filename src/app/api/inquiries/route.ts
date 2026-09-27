import { prisma } from '@/lib/db';
import { inquirySchema, newInquiryId, type InquiryRecord } from '@/lib/inquiry';
import { sendInquiryMail } from '@/lib/mail';
import { currentUser } from '@/lib/session';
import { badRequest, json, readJson, unauthorized } from '@/lib/http';

export const runtime = 'nodejs';

/** 제출 — 허니팟 검사 → 저장 → 메일. 메일이 실패해도 저장은 남는다. */
export async function POST(req: Request) {
  const parsed = inquirySchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return json({ error: 'invalid', fields: parsed.error.flatten().fieldErrors }, 400);
  }
  const { hp, ...data } = parsed.data;
  if (hp) return badRequest('rejected'); // 봇이 채운 칸

  const rec: InquiryRecord = { ...data, id: newInquiryId(), createdAt: Date.now() };

  // DB 를 아직 연결하지 않았으면 저장은 건너뛰고 메일만 보낸다
  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) console.warn('[inquiry] DATABASE_URL 이 없어 저장하지 않고 메일만 보냅니다', rec.id);

  let saved = false;
  if (hasDb) try {
    await prisma.inquiry.create({
      data: {
        id: rec.id, plan: rec.plan, company: rec.company, name: rec.name, jobTitle: rec.title,
        email: rec.email, phone: rec.phone, teamSize: rec.teamSize, manualTypes: rec.manualTypes,
        currentTool: rec.currentTool, pain: rec.pain, timeline: rec.timeline, needs: rec.needs,
        note: rec.note, consent: rec.consent, source: rec.source, createdAt: new Date(rec.createdAt),
      },
    });
    saved = true;
  } catch (e) {
    console.error('[inquiry] 저장 실패', rec.id, e);
  }

  let mailed = false;
  try { mailed = await sendInquiryMail(rec); }
  catch (e) { console.error('[inquiry] 메일 예외', rec.id, e); }

  if (saved && mailed) {
    await prisma.inquiry.update({ where: { id: rec.id }, data: { mailed: true } }).catch(() => {});
  }

  return json({ record: rec, saved, mailed }, saved || mailed ? 201 : 502);
}

/** 문의함 — ADMIN 만 */
export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return json({ error: 'forbidden' }, 403);
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return json({ inquiries: rows });
}
