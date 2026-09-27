import { PrismaClient } from '@prisma/client';

// 개발 중 핫 리로드마다 연결이 늘지 않도록 전역에 한 벌만 둔다.
const g = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = g.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
