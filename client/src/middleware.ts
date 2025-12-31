// middleware.ts (Next.js App Router)
import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// Define protected and public routes
// const protectedRoutes = ['/dashboard', '/settings', '/profile'];
// const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware() {
  // const { pathname } = _request.nextUrl;

  // Get access token from cookies or check if exists in the client
  // Note: Since we're using localStorage, we can't check on server-side middleware
  // This middleware will redirect based on path patterns
  // The actual auth check will be done client-side in the components

  // Check if the current route is protected
  // const isProtectedRoute = protectedRoutes.some((route) =>
  //   pathname.startsWith(route)
  // );

  // Check if the current route is an auth route
  // const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Add security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
