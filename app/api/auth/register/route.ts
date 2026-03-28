import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, createAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400);
    }

    const { name, email, password } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(password);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, verifyToken, verifyTokenExpiry, isEmailVerified: false },
      select: { id: true, name: true, email: true, currency: true },
    });

    await sendVerificationEmail(user.email, verifyToken);

    return apiSuccess({ message: 'Registration successful. Please check your email to verify your account.' }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return apiError('Internal server error', 500);
  }
}
