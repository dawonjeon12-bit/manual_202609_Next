'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';

// 문서함이 브라우저(localStorage)에 있으므로 서버에서는 그리지 않는다
const Workspace = dynamic(() => import('@/components/editor/Workspace').then(m => m.Workspace), {
  ssr: false,
  loading: () => <Loading />,
});

export function EditorClient() {
  return <Workspace />;
}
