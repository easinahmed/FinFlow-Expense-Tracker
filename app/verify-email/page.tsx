'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function VerificationContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The token may be invalid or expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-xl border border-gray-100 dark:border-zinc-800 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-500">
            <div className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 p-4">
              <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Verifying Email</h2>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="rounded-full bg-green-50 dark:bg-green-900/30 p-4">
              <MailCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Verified!</h2>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Redirecting to login...</p>
            <Button asChild className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/login">
                Go to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="rounded-full bg-red-50 dark:bg-red-900/30 p-4">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="text-red-500 dark:text-red-400 font-medium">{message}</p>
            <Button asChild variant="outline" className="mt-4 w-full border-gray-200 dark:border-zinc-800">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
}
