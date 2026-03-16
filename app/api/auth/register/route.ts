import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, createAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return apiError(result.error.errors[0].message, 400);
    }

    const { name, email, password } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, currency: true },
    });

    const token = await signToken({ userId: user.id, email: user.email, name: user.name });
    const cookie = createAuthCookie(token);

    const response = apiSuccess({ user }, 201);
    response.headers.set('Set-Cookie', 
      `${cookie.name}=${cookie.value}; HttpOnly; ${cookie.secure ? 'Secure;' : ''} SameSite=Lax; Max-Age=${cookie.maxAge}; Path=/`
    );
    
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return apiError('Internal server error', 500);
  }
}
