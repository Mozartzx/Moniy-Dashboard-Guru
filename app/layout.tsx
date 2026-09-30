import type { Metadata } from 'next';
import { Fredoka, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dashboard Guru | MONIY',
  description: 'Prototype frontend Dashboard Guru MONIY dengan data contoh.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${fredoka.variable}`}>{children}</body>
    </html>
  );
}
