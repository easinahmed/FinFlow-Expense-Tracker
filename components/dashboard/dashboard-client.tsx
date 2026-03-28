'use client';

import { formatCurrency, formatDate, percentChange, clampPercent } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/misc';
import { MonthlyChart } from '@/components/charts/monthly-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, PiggyBank, Target, AlertTriangle, SkipBackIcon } from 'lucide-react';
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { title: t('totalBalance'), amount: stats.totalBalance, subtitle: t('allTimeNet'), icon: Wallet, change: null },
          { title: t('monthlyIncome'), amount: stats.monthlyIncome, subtitle: t('thisMonth'), icon: TrendingUp, change: incomeChange },
          { title: t('monthlyExpense'), amount: stats.monthlyExpense, subtitle: t('thisMonth'), icon: TrendingDown, change: -expenseChange },
          { title: t('monthlySavings'), amount: stats.monthlySavings, subtitle: t('incomeMinusExpenses'), icon: SkipBackIcon, change: null },
        ].map(({ title, amount, subtitle, icon: Icon, change }) => (
          <div key={title} className="stat-card bg-card border border-border p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-[11px] sm:text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-display mt-0.5 sm:mt-1 tracking-tight break-words">
                  {formatCurrency(amount, currency)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{subtitle}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 ml-2">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
            </div>
            {typeof change === 'number' && (
              <div className={cn('flex items-center gap-1 mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium', change >= 0 ? 'text-income' : 'text-expense')}>
                {change >= 0 ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span>{Math.abs(change).toFixed(1)}% {t('vsLastMonth')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">{t('budgetStatus')}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8">
                <Link href="/budget">{t('manage')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {budgets.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/40" />
                <p className="text-xs sm:text-sm text-muted-foreground">{t('noBudgetsSet')}</p>
                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link href="/budget">{t('setBudget')}</Link>
                </Button>
              </div>
            ) : budgets.slice(0, 4).map(budget => {
              const pct = clampPercent((budget.spent / budget.amount) * 100);
              const isWarning = pct >= 80 && pct < 100;
              const isOver = pct >= 100;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      {(isWarning || isOver) && <AlertTriangle className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0', isOver ? 'text-expense' : 'text-warning')} />}
                      <span className="font-medium text-xs sm:text-sm leading-tight break-words">{budget.category?.name || t('overall')}</span>
                    </div>
                    <span className={cn('text-[10px] sm:text-xs', isOver ? 'text-expense' : isWarning ? 'text-warning' : 'text-muted-foreground')}>
                      {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.amount, currency)}
                    </span>
                  </div>
                  <Progress value={pct} className={cn('h-1.5 sm:h-2', isOver ? '[&>div]:bg-expense' : isWarning ? '[&>div]:bg-warning' : '')} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">{t('recentTransactions')}</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-[10px] sm:text-xs px-2 sm:px-3 h-7 sm:h-8">
                <Link href="/transactions">{t('viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 sm:px-6">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">{t('noTransactionsYet')}</p>
                <Button asChild size="sm" variant="outline" className="text-xs"><Link href="/expenses?action=add">{t('addFirst')}</Link></Button>
              </div>
            ) : recentTransactions.map(txn => (
              <div key={txn.id} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 text-xs sm:text-sm" style={{ backgroundColor: txn.category.color + '20' }}>
                  <span style={{ color: txn.category.color }}>●</span>
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[11px] sm:text-sm font-medium leading-tight mb-0.5 break-words">{txn.description}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground break-words">{txn.category.name} · {formatDate(txn.date, 'MMM dd')}</p>
                </div>
                <span className={cn('text-xs sm:text-sm font-semibold shrink-0', txn.type === 'INCOME' ? 'text-income' : 'text-expense')}>
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
