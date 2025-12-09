// ==================== MIDDLEWARE (ROUTE PROTECTION) ====================
// Fungsi: Protect routes & redirect berdasarkan authentication + role
// OPTIONAL: Bisa di-skip kalau cuma mau client-side refresh

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname.startsWith('/admin/login');

  // --- REFRESH TOKEN KALAU ACCESS TOKEN KOSONG ---
  if (!accessToken && refreshToken && !isAuthPage) {
    try {
      const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
        method: 'POST',
        headers: {
          'Cookie': `refreshToken=${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newAccessToken = data.accessToken;

        // Update variable accessToken
        accessToken = newAccessToken;

        // Set cookie baru
        const response = NextResponse.next();
        response.cookies.set('accessToken', newAccessToken, {
          httpOnly: false,
          path: '/',
          maxAge: 60 * 15,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        // JANGAN return di sini, biar lanjut ke role checking
      }
    } catch (error) {
      console.error('Middleware refresh error:', error);
    }
  }

  const isAuthenticated = !!(accessToken || refreshToken);

  // --- REDIRECT KALAU SUDAH LOGIN ---
  if (isAuthPage && isAuthenticated) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (userRole === 'sekolah') {
      return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
    } else if (userRole === 'sppg') {
      return NextResponse.redirect(new URL('/sppg/dashboard', request.url));
    }
  }

  // --- PROTECT ADMIN ROUTES ---
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (userRole !== 'admin') {
      if (userRole === 'sekolah') {
        return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
      }
      if (userRole === 'sppg') {
        return NextResponse.redirect(new URL('/sppg/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Return dengan cookie baru kalau ada refresh
    if (accessToken && !request.cookies.get('accessToken')?.value) {
      const response = NextResponse.next();
      response.cookies.set('accessToken', accessToken, {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 15,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }
  }

  // --- PROTECT SEKOLAH ROUTES ---
  if (pathname.startsWith('/sekolah')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'sekolah') {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (userRole === 'sppg') {
        return NextResponse.redirect(new URL('/sppg/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Return dengan cookie baru kalau ada refresh
    if (accessToken && !request.cookies.get('accessToken')?.value) {
      const response = NextResponse.next();
      response.cookies.set('accessToken', accessToken, {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 15,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }
  }

  // --- PROTECT SPPG ROUTES ---
  if (pathname.startsWith('/sppg')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'sppg') {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (userRole === 'sekolah') {
        return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Return dengan cookie baru kalau ada refresh
    if (accessToken && !request.cookies.get('accessToken')?.value) {
      const response = NextResponse.next();
      response.cookies.set('accessToken', accessToken, {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 15,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
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