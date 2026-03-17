import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { transactionSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type');
  const categoryId = searchParams.get('categoryId');
  const paymentMethod = searchParams.get('paymentMethod');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'date';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const where: any = { userId: auth.userId };

  if (type && type !== 'ALL') where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (paymentMethod && paymentMethod !== 'ALL') where.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { note: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return apiSuccess({
    data: transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  try {
    const body = await req.json();
    const result = transactionSchema.safeParse({
      ...body,
      amount: parseFloat(body.amount),
    });

    if (!result.success) {
      return apiError(result.error.issues[0].message, 400);
    }

    const data = result.data;

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: auth.userId,
      },
      include: { category: true },
    });

    // Update budget spent amount
    if (data.type === 'EXPENSE') {
      const now = new Date(data.date);
      await prisma.budget.updateMany({
        where: {
          userId: auth.userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          OR: [{ categoryId: data.categoryId }, { categoryId: null }],
        },
        data: { spent: { increment: data.amount } },
      });
    }

    return apiSuccess(transaction, 201);
  } catch (error) {
    console.error('Create transaction error:', error);
    return apiError('Internal server error', 500);
  }
}
