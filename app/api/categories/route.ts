import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: auth.userId }, { isDefault: true, userId: null }] },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  return apiSuccess(categories);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const body = await req.json();
  const result = categorySchema.safeParse(body);
  if (!result.success) return apiError(result.error.errors[0].message, 400);

  const category = await prisma.category.create({
    data: { ...result.data, userId: auth.userId },
  });

  return apiSuccess(category, 201);
}
