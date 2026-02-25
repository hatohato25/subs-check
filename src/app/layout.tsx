import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SubsCheck | あなたのサブスク、いくら？',
  description: 'サブスクリプションを選択して月額課金額を可視化。SNSでシェアして友達と比較しよう。',
  keywords: ['サブスク', 'サブスクリプション', '月額', '管理', '可視化', 'Netflix', 'Spotify'],
  authors: [{ name: 'SubsCheck' }],
  openGraph: {
    title: 'SubsCheck | あなたのサブスク、いくら？',
    description: 'サブスクリプションを選択して月額課金額を可視化',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SubsCheck | あなたのサブスク、いくら？',
    description: 'サブスクリプションを選択して月額課金額を可視化',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FDFCFB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${jetbrainsMono.variable} ${bebasNeue.variable} ${dmSans.variable}`}
    >
      <body className="bg-paper-aged text-ink antialiased">{children}</body>
    </html>
  );
}
