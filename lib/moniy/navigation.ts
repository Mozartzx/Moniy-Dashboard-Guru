import {
  BarChart3,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  ShieldAlert,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

export type DashboardRoute = {
  href: string;
  label: string;
  title: string;
  icon: LucideIcon;
  showsCommunityBadge?: boolean;
};

export const dashboardRoutes: DashboardRoute[] = [
  { href: '/dashboard/ringkasan', label: 'Ringkasan', title: 'Ringkasan kelas', icon: LayoutDashboard },
  { href: '/dashboard/progres-belajar', label: 'Progres Belajar', title: 'Progres belajar', icon: BarChart3 },
  { href: '/dashboard/rekam-siswa', label: 'Rekam Siswa', title: 'Rekam siswa', icon: UsersRound },
  { href: '/dashboard/peringatan-judi', label: 'Peringatan Judi', title: 'Peringatan judi online', icon: ShieldAlert },
  { href: '/dashboard/komunitas-kelas', label: 'Komunitas Kelas', title: 'Komunitas kelas', icon: MessagesSquare, showsCommunityBadge: true },
  { href: '/dashboard/laporan', label: 'Laporan', title: 'Laporan kelas', icon: FileText },
];

export function getDashboardRoute(pathname: string) {
  return dashboardRoutes.find((route) => pathname === route.href) ?? dashboardRoutes[0];
}
