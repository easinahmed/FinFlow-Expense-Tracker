import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Amount must be positive').max(1_000_000_000),
  description: z.string().min(1, 'Description is required').max(200),
  note: z.string().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'CRYPTO', 'OTHER']),
  currency: z.string().default('USD'),
  tags: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
  recurringFreq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  categoryId: z.string().min(1, 'Category is required'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string().default('tag'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color').default('#6366f1'),
  type: z.enum(['INCOME', 'EXPENSE', 'BOTH']).default('BOTH'),
});

export const budgetSchema = z.object({
  amount: z.number().positive('Budget must be positive').max(1_000_000_000),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  categoryId: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
  currency: z.string().min(3).max(3),
  avatar: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
