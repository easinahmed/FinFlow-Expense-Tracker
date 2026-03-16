import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const existing = await prisma.category.findFirst({
    where: { id: params.id, userId: auth.userId },
  });
  if (!existing) return apiError('Category not found or cannot edit default', 404);

  const body = await req.json();
  const result = categorySchema.safeParse(body);
  if (!result.success) return apiError(result.error.errors[0].message, 400);

  const category = await prisma.category.update({
    where: { id: params.id },
    data: result.data,
  });

  return apiSuccess(category);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const existing = await prisma.category.findFirst({
    where: { id: params.id, userId: auth.userId },
  });
  if (!existing) return apiError('Category not found or cannot delete default', 404);

  await prisma.category.delete({ where: { id: params.id } });
  return apiSuccess({ message: 'Category deleted' });
}
