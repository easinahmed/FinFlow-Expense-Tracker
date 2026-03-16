import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { transactionSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const transaction = await prisma.transaction.findFirst({
    where: { id: params.id, userId: auth.userId },
    include: { category: true },
  });

  if (!transaction) return apiError('Transaction not found', 404);
  return apiSuccess(transaction);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: params.id, userId: auth.userId },
    });
    if (!existing) return apiError('Transaction not found', 404);

    const body = await req.json();
    const result = transactionSchema.safeParse({
      ...body,
      amount: parseFloat(body.amount),
    });

    if (!result.success) return apiError(result.error.errors[0].message, 400);

    const data = result.data;

    // Reverse old budget impact if expense
    if (existing.type === 'EXPENSE') {
      const oldDate = new Date(existing.date);
      await prisma.budget.updateMany({
        where: {
          userId: auth.userId,
          month: oldDate.getMonth() + 1,
          year: oldDate.getFullYear(),
          OR: [{ categoryId: existing.categoryId }, { categoryId: null }],
        },
        data: { spent: { decrement: existing.amount } },
      });
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: { ...data, date: new Date(data.date) },
      include: { category: true },
    });

    // Apply new budget impact
    if (data.type === 'EXPENSE') {
      const newDate = new Date(data.date);
      await prisma.budget.updateMany({
        where: {
          userId: auth.userId,
          month: newDate.getMonth() + 1,
          year: newDate.getFullYear(),
          OR: [{ categoryId: data.categoryId }, { categoryId: null }],
        },
        data: { spent: { increment: data.amount } },
      });
    }

    return apiSuccess(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: auth.userId },
  });
  if (!existing) return apiError('Transaction not found', 404);

  await prisma.transaction.delete({ where: { id: params.id } });

  // Reverse budget impact
  if (existing.type === 'EXPENSE') {
    const date = new Date(existing.date);
    await prisma.budget.updateMany({
      where: {
        userId: auth.userId,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        OR: [{ categoryId: existing.categoryId }, { categoryId: null }],
      },
      data: { spent: { decrement: existing.amount } },
    });
  }

  return apiSuccess({ message: 'Transaction deleted' });
}
