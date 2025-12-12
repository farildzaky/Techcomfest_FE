import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname.startsWith('/admin/login');

  // --- BAGIAN INI DIHAPUS/DIKOMENTARI AGAR TIDAK BENTROK ---
  // if (!accessToken && refreshToken && !isAuthPage) {
  //   ... (Logic refresh middleware dihapus) ...
  // }
  // ---------------------------------------------------------

  // Kita anggap user "Authenticated" selama dia punya Refresh Token.
  // Urusan Access Token expired biar "fetchWithAuth" di client yang perbarui.
  const isAuthenticated = !!(accessToken || refreshToken);

  // --- LOGIC REDIRECT/ROLE CHECK (TETAP SAMA) ---
  if (isAuthPage && isAuthenticated) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (userRole === 'sekolah') {
      return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
    } else if (userRole === 'sppg') {
      return NextResponse.redirect(new URL('/sppg/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAuthenticated || userRole !== 'admin') {
       return NextResponse.redirect(new URL(isAuthenticated ? '/login' : '/admin/login', request.url));
    }
  }

  if (pathname.startsWith('/sekolah')) {
    if (!isAuthenticated || userRole !== 'sekolah') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/sppg')) {
    if (!isAuthenticated || userRole !== 'sppg') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
    '/sekolah/:path*',
    '/sppg/:path*',
  ],
};