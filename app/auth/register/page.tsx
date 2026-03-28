'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, TrendingUp, Loader2, Check } from 'lucide-react';
import { registerSchema, RegisterInput } from '@/lib/validations';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast({ title: t('accountCreated'), description: 'Please check your email for the verification code.' });
      setTimeout(() => {
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(data.email)}`;
      }, 500);
      return; // Let loader persist while routing
    } catch (err: any) {
      toast({ title: t('error') || 'Registration failed', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold font-display">FinFlow</span>
      </div>

      <Card className="border-border/50 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-display">{t('createAccount')}</CardTitle>
          <CardDescription>{t('startTracking')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullName')}</Label>
              <Input id="name" placeholder="John Doe" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`${errors.password ? 'border-destructive' : ''} pr-10`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1 mt-2">
                  {[
                    { ok: passwordStrength.hasLength, text: t('min8Chars') },
                    { ok: passwordStrength.hasUpper, text: t('upperCaseLetter') },
                    { ok: passwordStrength.hasNumber, text: t('numberCount') },
                  ].map(({ ok, text }) => (
                    <div key={text} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-income' : 'text-muted-foreground'}`}>
                      <Check className="w-3 h-3" />
                      {text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('creating')}</> : t('createAccount')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pt-0 justify-center">
          <p className="text-sm text-muted-foreground">
            {t('alreadyHaveAccount')} {` `}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">{t('signIn')}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
