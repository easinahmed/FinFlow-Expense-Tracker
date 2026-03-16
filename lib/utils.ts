import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, fmt = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatShortDate(date: string | Date): string {
  return formatDate(date, 'MMM dd');
}

export function getMonthRange(monthsBack = 0) {
  const date = subMonths(new Date(), monthsBack);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getLast12Months(): { month: string; label: string; start: Date; end: Date }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i);
    return {
      month: format(date, 'yyyy-MM'),
      label: format(date, 'MMM'),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'MOBILE_PAYMENT', label: 'Mobile Payment' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'BDT', label: 'BDT (৳)', symbol: '৳' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
] as const;

export function getCurrencySymbol(currency: string): string {
  return CURRENCIES.find(c => c.value === currency)?.symbol ?? currency;
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}
