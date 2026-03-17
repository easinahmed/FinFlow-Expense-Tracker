import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { TopBar } from '@/components/layout/topbar';
import { PWAInstallPrompt } from '@/components/layout/pwa-install-prompt';
import { ServiceWorkerRegister } from '@/components/layout/sw-register';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthUser();
  if (!auth) redirect('/auth/login');

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, currency: true, avatar: true },
  });

  if (!user) redirect('/auth/login');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ServiceWorkerRegister />
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
      <PWAInstallPrompt />
    </div>
  );
}
