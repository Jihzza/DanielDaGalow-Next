// middleware.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // If the cookie is set, update the request and response cookies.
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          // If the cookie is removed, update the request and response cookies.
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if expired - important for Server Components
  // and for session to be available on server-side page loads
  const { data: { session } } = await supabase.auth.getSession();

  // **Route Protection Logic (Example)**
  const { pathname } = request.nextUrl;

  // Define protected routes (user must be logged in)
  const protectedRoutes = ['/profile', '/settings', '/calendar', '/edit-profile' /* add more */];
  // Define auth routes (user should NOT be logged in to access)
  // You will need to create these pages in app/ (e.g., app/login/page.jsx)
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login'; // Or your designated login page
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/profile'; // Or their dashboard/profile
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (your public assets folder)
     * - api (your API routes, unless you want them protected by this middleware too)
     * Feel free to add more public paths here
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api/stripe/webhooks|api/status|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};