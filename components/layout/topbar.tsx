'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export function TopBar({ user }: { user: { name: string; currency: string } }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { t } = useLanguage();

  const pageTitles: Record<string, string> = {
    '/dashboard': t('dashboard'),
    '/transactions': t('transactions'),
    '/income': t('income'),
    '/expenses': t('expenses'),
    '/categories': t('categories'),
    '/reports': t('reports'),
    '/budget': t('budget'),
    '/settings': t('settings'),
  };

  const title = pageTitles[pathname] || 'FinFlow';

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-40">
      <div>
        <h1 className="font-display text-lg font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-2">

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
