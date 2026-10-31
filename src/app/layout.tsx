import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_KR } from 'next/font/google';
import { REVEAL_BOOT } from '@/components/Reveal';
import '@/styles/tokens.css';
import '@/styles/typography.css';
import '@/styles/site.css';
import '@/styles/home.css';
import '@/styles/editor.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const notoKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-noto-kr', display: 'swap', preload: false });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: { default: '모두의 매뉴얼', template: '%s · 모두의 매뉴얼' },
  description: 'AI와 함께 내용에 맞는 업무 매뉴얼을 만드는 도구',
  openGraph: { siteName: '모두의 매뉴얼', locale: 'ko_KR', type: 'website' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: 그리기 전 스크립트가 <html> 에 rv 클래스를 붙이므로
    <html lang="ko" className={`${inter.variable} ${notoKr.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
