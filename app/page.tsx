'use client';

import { useRouter } from 'next/navigation';
import { MoniyApp } from '@/components/moniy/moniy-app';

export default function Home() {
  const router = useRouter();
  return <MoniyApp onLogin={() => router.push('/dashboard/ringkasan')} />;
}
