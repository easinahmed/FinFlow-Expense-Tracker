import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/api/auth/login', '/api/auth/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files, api routes except protected ones
  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname === '/manifest.json' || pathname === '/sw.js') {
    return NextResponse.next();
  }

  // Check auth for app routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/transactions') || 
      pathname.startsWith('/income') || pathname.startsWith('/expenses') || 
      pathname.startsWith('/categories') || pathname.startsWith('/reports') || 
      pathname.startsWith('/budget') || pathname.startsWith('/settings') ||
      (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'))) {
    
    const token = req.cookies.get('finflow-auth')?.value;
    
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (pathname.startsWith('/api/')) {
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
