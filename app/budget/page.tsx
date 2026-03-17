'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema, BudgetInput } from '@/lib/validations';
import { useCategories } from '@/hooks/use-categories';
import { Budget } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/misc';
import { toast } from '@/components/ui/toaster';
import { formatCurrency, clampPercent } from '@/lib/utils';
import { Plus, Target, AlertTriangle, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/language-context';

export default function BudgetPage() {
  const { t } = useLanguage();
  const { categories, fetchCategories } = useCategories();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { month, year },
  });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const json = await res.json();
      if (res.ok) setBudgets(json.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchBudgets(); }, [month, year]);

  const onSubmit = async (data: BudgetInput) => {
    setFormLoading(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amount: data.amount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({ title: t('budgetSaved') });
      setShowForm(false);
      reset();
      fetchBudgets();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setFormLoading(false); }
  };

  const deleteBudget = async (id: string) => {
    const res = await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast({ title: t('budgetDeleted') }); fetchBudgets(); }
  };

  const getMonthName = (m: number) => {
    const keys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
    return t(keys[m - 1]);
  };
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
  const years = [2023, 2024, 2025, 2026];

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalBudgeted > 0 ? clampPercent((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex-1" />
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> {t('addBudget')}
        </Button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <Card className={cn(overallPct >= 100 ? 'border-expense/30' : overallPct >= 80 ? 'border-warning/30' : '')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold">{t('overallBudget')}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(totalSpent)} {t('spentOf')} {formatCurrency(totalBudgeted)}
                </p>
              </div>
              <div className={cn('text-2xl font-bold font-display', overallPct >= 100 ? 'text-expense' : overallPct >= 80 ? 'text-warning' : 'text-income')}>
                {overallPct.toFixed(0)}%
              </div>
            </div>
            <Progress value={overallPct} className={cn('h-3', overallPct >= 100 ? '[&>div]:bg-expense' : overallPct >= 80 ? '[&>div]:bg-warning' : '[&>div]:bg-income')} />
            {overallPct >= 80 && (
              <div className={cn('flex items-center gap-2 mt-3 text-sm', overallPct >= 100 ? 'text-expense' : 'text-warning')}>
                <AlertTriangle className="w-4 h-4" />
                {overallPct >= 100 ? t('budgetExceeded') : t('approachingLimit')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <Target className="w-12 h-12 text-muted-foreground/30" />
            <p className="font-semibold">{t('noBudgetsThisPeriod')}</p>
            <p className="text-sm text-muted-foreground">{t('setBudgetsDescription')}</p>
            <Button onClick={() => setShowForm(true)} className="gap-1.5 mt-2"><Plus className="w-4 h-4" />{t('createFirstBudget')}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const pct = clampPercent((budget.spent / budget.amount) * 100);
            const isOver = pct >= 100;
            const isWarn = pct >= 80 && !isOver;
            const remaining = budget.amount - budget.spent;
            return (
              <Card key={budget.id} className={cn('transition-all', isOver ? 'border-expense/30' : isWarn ? 'border-warning/30' : '')}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {budget.category && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: budget.category.color + '20' }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: budget.category.color }} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{budget.category?.name || t('overallBudget')}</p>
                        <p className="text-xs text-muted-foreground">{months.find(m=>m.value===budget.month)?.label} {budget.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isOver ? <AlertTriangle className="w-4 h-4 text-expense" /> : isWarn ? <AlertTriangle className="w-4 h-4 text-warning" /> : <CheckCircle2 className="w-4 h-4 text-income" />}
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => deleteBudget(budget.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} className={cn('h-2 mb-3', isOver ? '[&>div]:bg-expense' : isWarn ? '[&>div]:bg-warning' : '[&>div]:bg-income')} />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('spent')}: <span className={cn('font-semibold', isOver ? 'text-expense' : 'text-foreground')}>{formatCurrency(budget.spent)}</span></span>
                    <span className="text-muted-foreground">{t('budget')}: <span className="font-semibold text-foreground">{formatCurrency(budget.amount)}</span></span>
                  </div>
                  <p className={cn('text-xs mt-1', remaining < 0 ? 'text-expense' : 'text-muted-foreground')}>
                    {remaining < 0 ? `${t('overBy')} ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} ${t('remaining')}`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Budget Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t('setBudgetTitle')}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('category')} <span className="text-xs text-muted-foreground">{t('noBudgetCategory')}</span></Label>
              <Select onValueChange={v => setValue('categoryId', v === 'overall' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder={t('overallBudget')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">{t('overallBudget')}</SelectItem>
                  {categories.filter(c => c.type !== 'INCOME').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('budgetAmount')}</Label>
              <Input type="number" step="0.01" placeholder="500.00" {...register('amount', { valueAsNumber: true })} className={errors.amount ? 'border-destructive' : ''} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('month')}</Label>
                <Select defaultValue={String(month)} onValueChange={v => setValue('month', Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('year')}</Label>
                <Select defaultValue={String(year)} onValueChange={v => setValue('year', Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>{t('cancel')}</Button>
              <Button type="submit" className="flex-1" disabled={formLoading}>
                {formLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{t('saveBudget')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
