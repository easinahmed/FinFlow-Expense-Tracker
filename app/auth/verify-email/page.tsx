'use client';

import { useState, Suspense, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

function OTPForm() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();
  const { toast } = useToast();

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: 'Invalid Code', description: 'Please enter the 6-digit verification code.', variant: 'destructive' });
      return;
    }

    if (!email) {
      toast({ title: 'Error', description: 'No email found to verify. Please try again.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Success', description: data.message || 'Email verified successfully! You can now log in.' });
        router.push('/auth/login');
      } else {
        toast({ title: 'Verification Failed', description: data.error || 'The code may be invalid or expired.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-xl border border-gray-100 dark:border-zinc-800 text-center relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 p-4 border border-indigo-100 dark:border-indigo-800/50 shadow-sm shadow-indigo-200/50 dark:shadow-none">
            <MailCheck className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-display">Verify Email</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            We sent a 6-digit code to <span className="font-semibold text-gray-800 dark:text-gray-200">{email || 'your email'}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6 mt-8">
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-4xl tracking-widest h-16 font-mono bg-gray-50 dark:bg-zinc-800/50 border-gray-200 focus-visible:ring-indigo-500 placeholder:text-gray-300 dark:placeholder:text-zinc-600"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-left mt-2">Enter the numeric code from your inbox.</p>
          </div>

          <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</> : 'Verify Account'}
          </Button>
        </form>

        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 text-sm text-gray-500">
          Didn't receive a code? Check your spam folder or <Link href="/auth/register" className="text-indigo-600 hover:underline font-medium">register again</Link>.
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    }>
      <OTPForm />
    </Suspense>
  );
}
