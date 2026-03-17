'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';

interface MonthlyChartProps {
  data: { month: string; income: number; expense: number }[];
  currency: string;
}

function CustomTooltip({ active, payload, label, currency }: any) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold mb-2">{t(label) || label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{t(p.name as any) || p.name}:</span>
          <span className="font-medium">{formatCurrency(p.value, currency)}</span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  const { t } = useLanguage();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => t(v) || v} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(value) => t(value as any) || value} />
        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={false} hide />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
