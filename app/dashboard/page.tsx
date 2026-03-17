import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, endOfYear } from 'date-fns';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

async function getDashboardData(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));

  // Build monthly data for last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMM').toLowerCase() };
  });

  const [allTimeGroups, monthlyGroups, prevMonthlyGroups, recentTxns, budgets, monthlyData] =
    await Promise.all([
      prisma.transaction.groupBy({ by: ['type'], where: { userId }, _sum: { amount: true } }),
      prisma.transaction.groupBy({ by: ['type'], where: { userId, date: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
      prisma.transaction.groupBy({ by: ['type'], where: { userId, date: { gte: prevStart, lte: prevEnd } }, _sum: { amount: true } }),
      prisma.transaction.findMany({ where: { userId }, include: { category: true }, orderBy: { date: 'desc' }, take: 5 }),
      prisma.budget.findMany({ where: { userId, month: now.getMonth() + 1, year: now.getFullYear() }, include: { category: true } }),
      Promise.all(months.map(async ({ start, end, label }) => {
        const result = await prisma.transaction.groupBy({ by: ['type'], where: { userId, date: { gte: start, lte: end } }, _sum: { amount: true } });
        return { month: label, income: result.find(r => r.type === 'INCOME')?._sum.amount || 0, expense: result.find(r => r.type === 'EXPENSE')?._sum.amount || 0 };
      })),
    ]);

  // Category spending for current month
  const categorySpend = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 6,
  });

  const catIds = categorySpend.map(c => c.categoryId);
  const cats = await prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true, color: true } });
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]));
  const categoryData = categorySpend.map(c => ({
    name: catMap[c.categoryId]?.name || 'Unknown',
    value: c._sum.amount || 0,
    color: catMap[c.categoryId]?.color || '#6366f1',
  }));

  const totalIncome = allTimeGroups.find(g => g.type === 'INCOME')?._sum.amount || 0;
  const totalExpense = allTimeGroups.find(g => g.type === 'EXPENSE')?._sum.amount || 0;
  const monthlyIncome = monthlyGroups.find(g => g.type === 'INCOME')?._sum.amount || 0;
  const monthlyExpense = monthlyGroups.find(g => g.type === 'EXPENSE')?._sum.amount || 0;
  const prevIncome = prevMonthlyGroups.find(g => g.type === 'INCOME')?._sum.amount || 0;
  const prevExpense = prevMonthlyGroups.find(g => g.type === 'EXPENSE')?._sum.amount || 0;

  return {
    stats: {
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      monthlySavings: monthlyIncome - monthlyExpense,
      prevMonthlyIncome: prevIncome,
      prevMonthlyExpense: prevExpense,
    },
    monthlyData,
    categoryData,
    recentTransactions: recentTxns,
    budgets,
  };
}

export default async function DashboardPage() {
  const auth = await getAuthUser();
  if (!auth) redirect('/auth/login');

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { name: true, currency: true },
  });

  const data = await getDashboardData(auth.userId);

  return <DashboardClient data={data} currency={user?.currency || 'USD'} userName={user?.name || ''} />;
}
