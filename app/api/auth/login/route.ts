import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, createAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400);
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError('Invalid email or password', 401);
    }

    if (!user.isEmailVerified) {
      return apiError('Please verify your email address before logging in.', 403);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return apiError('Invalid email or password', 401);
    }

    const token = await signToken({ userId: user.id, email: user.email, name: user.name });
    const cookie = createAuthCookie(token);

    const response = apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
    });
    
    response.headers.set('Set-Cookie',
      `${cookie.name}=${cookie.value}; HttpOnly; ${cookie.secure ? 'Secure;' : ''} SameSite=Lax; Max-Age=${cookie.maxAge}; Path=/`
    );
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Internal server error', 500);
  }
}
