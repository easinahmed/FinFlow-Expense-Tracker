// Simplified toast hook
import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach(fn => fn([...currentToasts]));
}

export function toast(opts: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  currentToasts = [...currentToasts, { ...opts, id }];
  notifyListeners();
  setTimeout(() => {
    currentToasts = currentToasts.filter(t => t.id !== id);
    notifyListeners();
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback((fn: (t: Toast[]) => void) => {
    toastListeners.push(fn);
    return () => { toastListeners = toastListeners.filter(l => l !== fn); };
  }, []);

  useState(() => {
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  });

  return {
    toast,
    toasts,
    dismiss: (id: string) => {
      currentToasts = currentToasts.filter(t => t.id !== id);
      notifyListeners();
    },
  };
}
