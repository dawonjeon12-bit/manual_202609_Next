import type { Metadata } from 'next';
import { EditorClient } from './EditorClient';

export const metadata: Metadata = { title: '작업 화면', robots: { index: false } };

/** 작업 화면 — 로그인 없이 바로 연다. 문서함은 이 브라우저에 저장된다. */
export default function EditorPage() {
  return <EditorClient />;
}
