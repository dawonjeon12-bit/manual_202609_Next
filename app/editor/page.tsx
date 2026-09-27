import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { createManual, listManuals } from '@/lib/manuals';
import { blankDoc } from '@/lib/manual';

export const dynamic = 'force-dynamic';

/** 문서함 — 가장 최근 문서를 연다. 문서함이 비었으면 빈 문서를 하나 만든다 (원본과 같은 동작). */
export default async function EditorIndex() {
  const user = await currentUser();
  if (!user) redirect('/login?callbackUrl=/editor');
  const docs = await listManuals(user.id);
  const id = docs[0]?.id ?? await createManual(user.id, blankDoc());
  redirect(`/editor/${id}`);
}
