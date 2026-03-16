'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowUpDown, BarChart3, Target, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/transactions', icon: ArrowUpDown, label: 'Txns' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/budget', icon: Target, label: 'Budget' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {mobileNav.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
