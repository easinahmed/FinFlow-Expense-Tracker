import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/utils';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const exportType = searchParams.get('type') || 'csv';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const where: any = { userId: auth.userId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  const rows = transactions.map(t => ({
    Date: format(new Date(t.date), 'yyyy-MM-dd'),
    Type: t.type,
    Description: t.description,
    Category: t.category.name,
    Amount: t.type === 'INCOME' ? t.amount : -t.amount,
    Currency: t.currency,
    'Payment Method': t.paymentMethod,
    Note: t.note || '',
    Tags: t.tags.join(', '),
  }));

  if (exportType === 'csv') {
    const headers = Object.keys(rows[0] || {}).join(',');
    const csvRows = rows.map(row =>
      Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers, ...csvRows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="finflow-export-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  }

  if (exportType === 'json') {
    return new Response(JSON.stringify(rows, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="finflow-export-${format(new Date(), 'yyyy-MM-dd')}.json"`,
      },
    });
  }

  return apiError('Invalid export type', 400);
}
