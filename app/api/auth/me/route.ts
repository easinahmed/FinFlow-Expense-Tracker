import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, currency: true, avatar: true, createdAt: true },
  });

  if (!user) return apiError('User not found', 404);
  return apiSuccess({ user });
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return apiError('Unauthorized', 401);

  const body = await req.json();
  const result = updateProfileSchema.safeParse(body);
  if (!result.success) return apiError(result.error.issues[0].message, 400);

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: result.data,
    select: { id: true, name: true, email: true, currency: true },
  });

  return apiSuccess({ user });
}
