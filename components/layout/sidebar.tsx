'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowUpDown, TrendingUp, TrendingDown,
  Tag, BarChart3, Target, Settings, TrendingUp as Logo,
  ChevronRight, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/misc';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export function Sidebar({ user }: { user: { name: string; email: string; currency: string; avatar?: string | null } }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/transactions', icon: ArrowUpDown, label: t('transactions') },
    { href: '/income', icon: TrendingUp, label: t('income') },
    { href: '/expenses', icon: TrendingDown, label: t('expenses') },
    { href: '/categories', icon: Tag, label: t('categories') },
    { href: '/reports', icon: BarChart3, label: t('reports') },
    { href: '/budget', icon: Target, label: t('budget') },
    { href: '/settings', icon: Settings, label: t('settings') },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col border-r border-border bg-card z-50">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Logo className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold font-display text-lg leading-none">FinFlow</p>
            <p className="text-xs text-muted-foreground">Smart Finance</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={cn('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive')}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 w-8 h-8 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
