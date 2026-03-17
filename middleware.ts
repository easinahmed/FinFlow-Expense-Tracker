import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

const COOKIE_NAME = 'finflow-auth';

const PROTECTED_PAGES = [
  '/dashboard', '/transactions', '/income', '/expenses',
  '/categories', '/reports', '/budget', '/settings',
];

const PUBLIC_PATHS = [
  '/auth/login', '/auth/register',
  '/api/auth/login', '/api/auth/register',
];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p));
  const isProtectedApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/');

  if (isProtectedPage || isProtectedApi) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (isProtectedApi) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};