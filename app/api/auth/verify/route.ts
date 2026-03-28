import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import z from 'zod';
import { apiError, apiSuccess } from '@/lib/utils';

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifySchema.safeParse(body);
    
    if (!result.success) {
      return apiError(result.error.issues[0].message, 400);
    }

    const { email, otp } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return apiError('User not found.', 404);
    }
    
    if (user.isEmailVerified) {
      return apiError('Email is already verified.', 400);
    }

    if (user.verifyToken !== otp) {
      return apiError('Invalid verification code.', 400);
    }

    if (!user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
      return apiError('Verification code has expired. Please register again or request a new one.', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    return apiSuccess({ message: 'Email verified successfully.' }, 200);
  } catch (error) {
    console.error('Verify error:', error);
    return apiError('Internal server error', 500);
  }
}
