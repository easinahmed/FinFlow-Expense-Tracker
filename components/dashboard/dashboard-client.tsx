'use client';

import { formatCurrency, formatDate, percentChange, clampPercent } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/misc';
import { MonthlyChart } from '@/components/charts/monthly-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, PiggyBank, Target, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';

interface DashboardClientProps {
  data: {
    stats: {
      totalBalance: number; totalIncome: number; totalExpense: number;
      monthlyIncome: number; monthlyExpense: number; monthlySavings: number;
      prevMonthlyIncome: number; prevMonthlyExpense: number;
    };
    monthlyData: { month: string; income: number; expense: number }[];
    categoryData: { name: string; value: number; color: string }[];
    recentTransactions: any[];
    budgets: any[];
  };
  currency: string;
  userName: string;
}

export function DashboardClient({ data, currency, userName }: DashboardClientProps) {
  const { stats, monthlyData, categoryData, recentTransactions, budgets } = data;
  const { t } = useLanguage();

  const incomeChange = percentChange(stats.monthlyIncome, stats.prevMonthlyIncome);
  const expenseChange = percentChange(stats.monthlyExpense, stats.prevMonthlyExpense);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 18 ? t('goodAfternoon') : t('goodEvening');

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-muted-foreground text-sm">{greeting},</h2>
          <h1 className="text-2xl font-bold font-display">{userName} 👋</h1>
        </div>
        <Button asChild size="sm" className="hidden sm:flex">
          <Link href="/expenses?action=add">+ {t('addExpenseBtn')}</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t('totalBalance'), amount: stats.totalBalance, subtitle: t('allTimeNet'), icon: Wallet, change: null },
          { title: t('monthlyIncome'), amount: stats.monthlyIncome, subtitle: t('thisMonth'), icon: TrendingUp, change: incomeChange },
          { title: t('monthlyExpense'), amount: stats.monthlyExpense, subtitle: t('thisMonth'), icon: TrendingDown, change: -expenseChange },
          { title: t('monthlySavings'), amount: stats.monthlySavings, subtitle: t('incomeMinusExpenses'), icon: PiggyBank, change: null },
        ].map(({ title, amount, subtitle, icon: Icon, change }) => (
          <div key={title} className="stat-card bg-card border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl md:text-3xl font-bold font-display mt-1 tracking-tight">
                  {formatCurrency(amount, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            {typeof change === 'number' && (
              <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', change >= 0 ? 'text-income' : 'text-expense')}>
                {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{Math.abs(change).toFixed(1)}% {t('vsLastMonth')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('incomeVsExpense')}</CardTitle>
            <CardDescription>{t('last12Months')}</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthlyData} currency={currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('spendingByCategory')}</CardTitle>
            <CardDescription>{t('thisMonth')}</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryData} currency={currency} />
          </CardContent>
        </Card>
      </div>

      {/* Budget & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('budgetStatus')}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/budget">{t('manage')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Target className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t('noBudgetsSet')}</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/budget">{t('setBudget')}</Link>
                </Button>
              </div>
            ) : budgets.slice(0, 4).map(budget => {
              const pct = clampPercent((budget.spent / budget.amount) * 100);
              const isWarning = pct >= 80 && pct < 100;
              const isOver = pct >= 100;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {(isWarning || isOver) && <AlertTriangle className={cn('w-3.5 h-3.5', isOver ? 'text-expense' : 'text-warning')} />}
                      <span className="font-medium">{budget.category?.name || t('overall')}</span>
                    </div>
                    <span className={cn('text-xs', isOver ? 'text-expense' : isWarning ? 'text-warning' : 'text-muted-foreground')}>
                      {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.amount, currency)}
                    </span>
                  </div>
                  <Progress value={pct} className={cn('h-2', isOver ? '[&>div]:bg-expense' : isWarning ? '[&>div]:bg-warning' : '')} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('recentTransactions')}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/transactions">{t('viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-sm text-muted-foreground">{t('noTransactionsYet')}</p>
                <Button asChild size="sm" variant="outline"><Link href="/expenses?action=add">{t('addFirst')}</Link></Button>
              </div>
            ) : recentTransactions.map(txn => (
              <div key={txn.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm" style={{ backgroundColor: txn.category.color + '20' }}>
                  <span style={{ color: txn.category.color }}>●</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">{txn.category.name} · {formatDate(txn.date, 'MMM dd')}</p>
                </div>
                <span className={cn('text-sm font-semibold shrink-0', txn.type === 'INCOME' ? 'text-income' : 'text-expense')}>
                  {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount, currency)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
