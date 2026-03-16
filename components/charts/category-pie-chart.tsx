'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryPieChartProps {
  data: { name: string; value: number; color: string }[];
  currency: string;
}

function CustomTooltip({ active, payload, currency }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold">{d.name}</p>
      <p className="text-muted-foreground">{formatCurrency(d.value, currency)}</p>
    </div>
  );
}

export function CategoryPieChart({ data, currency }: CategoryPieChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No spending data this month
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="mt-2 space-y-1">
        {data.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground truncate max-w-[100px]">{item.name}</span>
            </div>
            <span className="font-medium">{formatCurrency(item.value, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
