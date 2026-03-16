'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let listeners: ((t: Toast[]) => void)[] = [];
let queue: Toast[] = [];

export function toast(opts: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  queue = [...queue, { ...opts, id }];
  listeners.forEach(fn => fn([...queue]));
  setTimeout(() => {
    queue = queue.filter(t => t.id !== id);
    listeners.forEach(fn => fn([...queue]));
  }, 4500);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const fn = (t: Toast[]) => setToasts(t);
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  return (
    <div className="fixed bottom-24 lg:bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-2xl border p-4 shadow-2xl animate-slide-up backdrop-blur-sm',
            t.variant === 'destructive'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-card border-border'
          )}
        >
          {t.variant === 'destructive'
            ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-income" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => {
              queue = queue.filter(q => q.id !== t.id);
              listeners.forEach(fn => fn([...queue]));
            }}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
