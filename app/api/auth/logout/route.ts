import { clearAuthCookie } from '@/lib/auth';
import { apiSuccess } from '@/lib/utils';

export async function POST() {
  const cookie = clearAuthCookie();
  const response = apiSuccess({ message: 'Logged out' });
  response.headers.set('Set-Cookie',
    `${cookie.name}=${cookie.value}; HttpOnly; ${cookie.secure ? 'Secure;' : ''} SameSite=Lax; Max-Age=0; Path=/`
  );
  return response;
}
