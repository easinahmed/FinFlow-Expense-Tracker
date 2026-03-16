import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

export default async function HomePage() {
  const auth = await getAuthUser();
  if (auth) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}
