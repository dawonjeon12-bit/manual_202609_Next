import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { getManual, listManuals } from '@/lib/manuals';
import { Workspace, type Flash } from '@/components/editor/Workspace';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '작업 화면', robots: { index: false } };

export default async function EditorPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flash?: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/login?callbackUrl=/editor/${encodeURIComponent(id)}`);

  const [manual, docs] = await Promise.all([getManual(user.id, id), listManuals(user.id)]);
  if (!manual) notFound(); // 다른 사람의 문서도 여기로 — 존재 여부를 드러내지 않는다

  const f = (await searchParams).flash;
  const flash: Flash = f === 'new' || f === 'deleted' ? f : null;

  // key: 문서를 옮길 때 편집 상태를 새로 시작한다
  return <Workspace key={manual.id} initialDocs={docs} initialManual={manual} flash={flash} />;
}
