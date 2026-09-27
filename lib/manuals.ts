/* 문서 저장소. 모든 쿼리는 userId 로 범위를 강제한다 — 다른 사람의 문서는 존재하지 않는 것과 같다. */
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from './db';
import { blankBrief, type Brief, type Manual, type ManualSummary } from './manual';

const str = (max: number) => z.string().max(max);

export const briefSchema = z.object({
  topic: str(4000), audience: str(400), purpose: str(400),
  tone: str(40), depth: str(40), raw: str(60000),
});

export const sectionSchema = z.object({
  id: str(64).min(1),
  type: str(20),
  title: str(200),
  body: str(200000),
  hint: str(400),
});

export const manualInputSchema = z.object({
  title: str(200), kind: str(20), code: str(60), rev: str(20),
  effectiveDate: str(20), owner: str(60), approver: str(60),
  brief: briefSchema,
  sections: z.array(sectionSchema).max(60),
});
export type ManualInput = z.infer<typeof manualInputSchema>;

const withSections = { sections: { orderBy: { order: 'asc' } } } satisfies Prisma.ManualInclude;
type Row = Prisma.ManualGetPayload<{ include: typeof withSections }>;

function toManual(r: Row): Manual {
  return {
    id: r.id, title: r.title, kind: r.kind, code: r.code, rev: r.rev,
    effectiveDate: r.effectiveDate, owner: r.owner, approver: r.approver, sample: r.sample,
    brief: { ...blankBrief(), ...((r.brief ?? {}) as Partial<Brief>) },
    sections: r.sections.map(s => ({ id: s.id, type: s.type, title: s.title, body: s.body, hint: s.hint })),
    updatedAt: r.updatedAt.getTime(),
  };
}

const sectionRows = (sections: ManualInput['sections']) =>
  sections.map((s, order) => ({ id: s.id, order, type: s.type, title: s.title, body: s.body, hint: s.hint }));

export async function listManuals(userId: string): Promise<ManualSummary[]> {
  const rows = await prisma.manual.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 60,
    select: { id: true, title: true, code: true, sample: true, updatedAt: true, _count: { select: { sections: true } } },
  });
  return rows.map(r => ({
    id: r.id, title: r.title, code: r.code, sample: r.sample,
    sectionCount: r._count.sections, updatedAt: r.updatedAt.getTime(),
  }));
}

export async function getManual(userId: string, id: string): Promise<Manual | null> {
  const r = await prisma.manual.findFirst({ where: { id, userId }, include: withSections });
  return r ? toManual(r) : null;
}

export async function createManual(userId: string, data: ManualInput & { sample?: boolean }): Promise<string> {
  const { sections, brief, ...head } = data;
  const r = await prisma.manual.create({
    data: {
      ...head, userId, sample: !!data.sample, brief,
      sections: { create: sectionRows(sections) },
    },
    select: { id: true },
  });
  return r.id;
}

/** 문서 전체를 덮어쓴다. 내 문서가 아니면 false. */
export async function updateManual(userId: string, id: string, data: ManualInput): Promise<number | null> {
  const { sections, brief, ...head } = data;
  return prisma.$transaction(async tx => {
    const owned = await tx.manual.updateMany({ where: { id, userId }, data: { ...head, brief } });
    if (!owned.count) return null;
    await tx.section.deleteMany({ where: { manualId: id } });
    if (sections.length) {
      await tx.section.createMany({ data: sectionRows(sections).map(s => ({ ...s, manualId: id })) });
    }
    const r = await tx.manual.findUniqueOrThrow({ where: { id }, select: { updatedAt: true } });
    return r.updatedAt.getTime();
  });
}

export async function deleteManual(userId: string, id: string): Promise<boolean> {
  const r = await prisma.manual.deleteMany({ where: { id, userId } });
  return r.count > 0;
}
