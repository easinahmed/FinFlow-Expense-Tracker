import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { budgetSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

  const budgets = await prisma.budget.findMany({
    where: { userId: auth.userId, month, year },
    include: { category: true },
  });

  return apiSuccess(budgets);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const body = await req.json();
  const result = budgetSchema.safeParse({ ...body, amount: parseFloat(body.amount) });
  if (!result.success) return apiError(result.error.errors[0].message, 400);

  const { amount, month, year, categoryId } = result.data;

  // Calculate current spent for this budget period
  const now = new Date(year, month - 1, 1);
  const endOfM = new Date(year, month, 0, 23, 59, 59);

  const spentResult = await prisma.transaction.aggregate({
    where: {
      userId: auth.userId,
      type: 'EXPENSE',
      date: { gte: now, lte: endOfM },
      ...(categoryId ? { categoryId } : {}),
    },
    _sum: { amount: true },
  });

  const spent = spentResult._sum.amount || 0;

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: auth.userId,
        categoryId: categoryId || null,
        month,
        year,
      },
    },
    update: { amount, spent },
    create: { amount, spent, month, year, userId: auth.userId, categoryId: categoryId || null },
    include: { category: true },
  });

  return apiSuccess(budget, 201);
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return apiError('Budget ID required', 400);

  await prisma.budget.deleteMany({ where: { id, userId: auth.userId } });
  return apiSuccess({ message: 'Budget deleted' });
}
