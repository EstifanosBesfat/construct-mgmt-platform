import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that strictly require user authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/materials',
  '/inventory',
  '/progress',
  '/timeline',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('cms_auth_session')?.value;

  // Check if current path starts with any protected route
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user tries to access protected route without valid auth cookie
  if (isProtected && !authCookie) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('auth', 'signin');
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
};
