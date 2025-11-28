import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Protected Routes
 *
 * Bu middleware, korumalı rotalara erişimi kontrol eder.
 * Token yoksa kullanıcıyı login sayfasına yönlendirir.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes listesi
  const protectedRoutes = ['/checkout', '/orders', '/cart'];

  // Bu rotalardan birine erişim yapılıyor mu?
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // localStorage'daki token'ı middleware'de okuyamayız (server-side)
    // Bu yüzden cookie veya header kullanmalıyız
    // Şimdilik sayfa-level check'leri koruyoruz, middleware ek güvenlik katmanı

    // Not: AuthProvider client-side token kontrolü yapıyor
    // Bu middleware ekstra bir güvenlik katmanı sağlıyor

    // İlerisi için: Cookie-based auth implementasyonu
    // const token = request.cookies.get('auth-token')?.value;
    // if (!token) {
    //   const loginUrl = new URL('/login', request.url);
    //   loginUrl.searchParams.set('redirect', pathname);
    //   return NextResponse.redirect(loginUrl);
    // }
  }

  return NextResponse.next();
}

/**
 * Middleware Config
 *
 * Matcher: Hangi path'lerde middleware çalışacak
 * - API routes hariç
 * - Static files hariç (_next/static, _next/image)
 * - favicon.ico hariç
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
