'use client';

import { MoniyApp } from '@/components/moniy/moniy-app';

export default function Home() {
  return <MoniyApp onLogin={() => window.location.assign('/dashboard/ringkasan')} />;
}
