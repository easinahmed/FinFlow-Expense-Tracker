'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthlyChart } from '@/components/charts/monthly-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { SpendingTrendChart } from '@/components/charts/spending-trend-chart';
import { formatCurrency } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, monthlyRes, categoryRes] = await Promise.all([
          fetch('/api/analytics?type=dashboard'),
          fetch('/api/analytics?type=monthly'),
          fetch(`/api/analytics?type=categories&month=${month}&year=${year}`),
        ]);
        const [s, m, c] = await Promise.all([statsRes.json(), monthlyRes.json(), categoryRes.json()]);
        setStats(s.data);
        setMonthlyData(m.data);
        setCategoryData(c.data);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [month, year]);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(2024, i), 'MMM') }));
  const years = [2023, 2024, 2025, 2026];

  const handleExport = () => window.open(`/api/export?type=csv`, '_blank');

  const savingsRate = stats && stats.monthlyIncome > 0
    ? ((stats.monthlySavings / stats.monthlyIncome) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Summary KPIs */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Income', value: stats.monthlyIncome, icon: TrendingUp, color: 'text-income' },
            { label: 'Monthly Expense', value: stats.monthlyExpense, icon: TrendingDown, color: 'text-expense' },
            { label: 'Net Savings', value: stats.monthlySavings, icon: PiggyBank, color: stats.monthlySavings >= 0 ? 'text-income' : 'text-expense' },
            { label: 'Savings Rate', value: null, icon: null, color: 'text-primary', text: `${savingsRate}%` },
          ].map(({ label, value, icon: Icon, color, text }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold font-display ${color}`}>
                  {text || formatCurrency(value || 0)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income vs Expenses (12 months)</CardTitle>
              <CardDescription>Monthly comparison over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-64 bg-muted rounded-xl animate-pulse" /> : <MonthlyChart data={monthlyData} currency="USD" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Spending by Category</CardTitle>
                <CardDescription>{months.find(m=>m.value===month)?.label} {year}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <div className="h-64 bg-muted rounded-xl animate-pulse" /> : <CategoryPieChart data={categoryData} currency="USD" />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  Array.from({length:5}).map((_,i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)
                ) : categoryData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No expense data for this period</p>
                ) : (
                  categoryData.map((cat, i) => {
                    const max = categoryData[0]?.value || 1;
                    const pct = (cat.value / max) * 100;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-muted-foreground">{formatCurrency(cat.value)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spending Trends</CardTitle>
              <CardDescription>Net savings trend over 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-64 bg-muted rounded-xl animate-pulse" /> : <SpendingTrendChart data={monthlyData} currency="USD" />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
