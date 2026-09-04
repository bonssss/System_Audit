import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'ai_scanner_session';

const PROTECTED_PREFIXES = ['/dashboard', '/projects', '/scans', '/settings'];
const AUTH_ROUTES = ['/login', '/register'];

/**
 * Checks whether a JWT is expired using base64 payload decoding (Edge & Node compatible).
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuth = Boolean(token && !isTokenExpired(token));

  // If user is accessing a protected route without a valid token
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);

    // If an invalid or expired cookie was present, clear it from browser
    if (token) {
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: '',
        expires: new Date(0),
        path: '/',
      });
    }
    return response;
  }

  // If user is authenticated and tries to visit login or register
  const isAuthPage = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api routes
     * - static files (images, icons)
     */
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
