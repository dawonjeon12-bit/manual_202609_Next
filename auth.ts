import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import { sampleDoc } from '@/lib/manual';
import { createManual } from '@/lib/manuals';

const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

/** 로그인할 때마다 User 를 맞춰 두고, 처음 온 사람에게는 예시 문서를 1건 만든다. */
async function syncUser(email: string, name: string | null | undefined) {
  const role = adminEmails().includes(email.toLowerCase()) ? 'ADMIN' : 'USER';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== role) await prisma.user.update({ where: { id: existing.id }, data: { role } });
    return { id: existing.id, role };
  }
  const user = await prisma.user.create({ data: { email, name: name ?? null, role } });
  await createManual(user.id, sampleDoc());
  return { id: user.id, role };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user }) {
      return !!user.email;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const u = await syncUser(user.email, user.name);
        token.uid = u.id;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as 'USER' | 'ADMIN') ?? 'USER';
      }
      return session;
    },
  },
});
