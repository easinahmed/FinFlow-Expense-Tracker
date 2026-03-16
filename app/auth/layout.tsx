import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthUser();
  if (auth) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="w-full max-w-md px-4 py-8">
        {children}
      </div>
    </div>
  );
}
