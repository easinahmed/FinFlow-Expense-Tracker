'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SpendingTrendChartProps {
  data: { month: string; income: number; expense: number }[];
  currency: string;
}

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  const savings = payload[0]?.value || 0;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className={savings >= 0 ? 'text-income' : 'text-expense'}>
        Net: {formatCurrency(savings, currency)}
      </p>
    </div>
  );
}

export function SpendingTrendChart({ data, currency }: SpendingTrendChartProps) {
  const enriched = data.map(d => ({ ...d, savings: d.income - d.expense }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={enriched} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="savings"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
