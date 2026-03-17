import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);
  const { id } = await params;
  const existing = await prisma.category.findFirst({ where: { id, userId: auth.userId } });
  if (!existing) return apiError('Category not found', 404);
  const body = await req.json();
  const result = categorySchema.safeParse(body);
  if (!result.success) return apiError(result.error.issues[0].message, 400);
  const category = await prisma.category.update({ where: { id }, data: result.data });
  return apiSuccess(category);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);
  const { id } = await params;
  const existing = await prisma.category.findFirst({ where: { id, userId: auth.userId } });
  if (!existing) return apiError('Category not found', 404);
  await prisma.category.delete({ where: { id } });
  return apiSuccess({ message: 'Category deleted' });
}