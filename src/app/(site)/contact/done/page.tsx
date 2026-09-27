import type { Metadata } from 'next';
import { INQUIRY_TO } from '@/lib/mail';
import { DoneView } from './DoneView';

export const metadata: Metadata = { title: '문의 접수', robots: { index: false } };

export default function ContactDone() {
  return <DoneView to={INQUIRY_TO} />;
}
