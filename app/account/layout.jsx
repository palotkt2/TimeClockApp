'use client';
import { usePathname } from 'next/navigation';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function AccountLayout({ children }) {
  const pathname = usePathname();

  // Don't apply dashboard layout to login and register pages
  if (
    pathname === '/account' ||
    pathname === '/account/register' ||
    pathname === '/account/recover'
  ) {
    return children;
  }

  // Apply dashboard layout to all other account pages
  return <DashboardLayout>{children}</DashboardLayout>;
}
