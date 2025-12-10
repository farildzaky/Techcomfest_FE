

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname.startsWith('/admin/login');

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

        accessToken = newAccessToken;

        const response = NextResponse.next();
        response.cookies.set('accessToken', newAccessToken, {
          httpOnly: false,
          path: '/',
          maxAge: 60 * 15,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

      }
    } catch (error) {
      console.error('Middleware refresh error:', error);
    }
  }

  const isAuthenticated = !!(accessToken || refreshToken);

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