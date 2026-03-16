import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/utils';
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, endOfYear } from 'date-fns';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'dashboard';

  if (type === 'dashboard') {
    return getDashboardStats(auth.userId);
  } else if (type === 'monthly') {
    return getMonthlyData(auth.userId);
  } else if (type === 'categories') {
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    return getCategoryData(auth.userId, month, year);
  }

  return apiError('Invalid analytics type', 400);
}

async function getDashboardStats(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));

  const [allTime, monthly, prevMonthly] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, date: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = allTime.find(g => g.type === 'INCOME')?._sum.amount || 0;
  const totalExpense = allTime.find(g => g.type === 'EXPENSE')?._sum.amount || 0;
  const monthlyIncome = monthly.find(g => g.type === 'INCOME')?._sum.amount || 0;
  const monthlyExpense = monthly.find(g => g.type === 'EXPENSE')?._sum.amount || 0;
  const prevIncome = prevMonthly.find(g => g.type === 'INCOME')?._sum.amount || 0;
  const prevExpense = prevMonthly.find(g => g.type === 'EXPENSE')?._sum.amount || 0;

  return apiSuccess({
    totalBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    monthlyIncome,
    monthlyExpense,
    monthlySavings: monthlyIncome - monthlyExpense,
    prevMonthlyIncome: prevIncome,
    prevMonthlyExpense: prevExpense,
  });
}

async function getMonthlyData(userId: string) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), 11 - i);
    return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMM') };
  });

  const data = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const result = await prisma.transaction.groupBy({
        by: ['type'],
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
      });
      return {
        month: label,
        income: result.find(r => r.type === 'INCOME')?._sum.amount || 0,
        expense: result.find(r => r.type === 'EXPENSE')?._sum.amount || 0,
      };
    })
  );

  return apiSuccess(data);
}

async function getCategoryData(userId: string, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const result = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const categoryIds = result.map(r => r.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const data = result.map(r => ({
    name: catMap[r.categoryId]?.name || 'Unknown',
    value: r._sum.amount || 0,
    color: catMap[r.categoryId]?.color || '#6366f1',
  }));

  return apiSuccess(data);
}
