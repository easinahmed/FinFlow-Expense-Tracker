import { NextRequest } from 'next/server';
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { changePasswordSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return apiError('Unauthorized', 401);

    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);
    
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400);
    }

    const { currentPassword, newPassword } = result.data;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return apiError('Incorrect current password', 400);
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashedNewPassword },
    });

    return apiSuccess({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return apiError('Internal server error', 500);
  }
}
