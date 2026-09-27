import { prisma } from './db';
import { AI_MONTHLY_LIMIT, planOf } from './plans';

const monthKey = () => new Date().toISOString().slice(0, 7);

/** 한 번의 AI 호출을 기록한다. 상한을 넘으면 false (기록하지 않음). */
export async function consumeAiCall(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const limit = AI_MONTHLY_LIMIT[planOf(user?.plan)];
  const month = monthKey();

  if (limit === null) {
    await prisma.aiUsage.upsert({
      where: { userId_month: { userId, month } },
      create: { userId, month, count: 1 },
      update: { count: { increment: 1 } },
    });
    return true;
  }

  // 조건부 증가 — 동시에 여러 요청이 와도 상한을 넘지 않는다.
  await prisma.aiUsage.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, count: 0 },
    update: {},
  });
  const { count } = await prisma.aiUsage.updateMany({
    where: { userId, month, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });
  return count === 1;
}
