import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper decode JWT sederhana untuk middleware (Edge Runtime friendly)
function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    // Buffer 10 detik
    return now > (exp - 10);
  } catch (e) {
    return true; // Anggap expired jika gagal parse
  }
}

export async function middleware(request: NextRequest) {
  let accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname === '/login' || pathname.startsWith('/admin/login');

  // --- LOGIC PROAKTIF MIDDLEWARE ---
  // Jika punya refresh token TAPI access token tidak ada ATAU expired
  if (refreshToken && (!accessToken || isTokenExpired(accessToken)) && !isAuthPage) {
    try {
      console.log("Middleware: Token expired or missing, refreshing...");
      // Panggil endpoint refresh kita sendiri
      const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
        method: 'POST',
        headers: {
          'Cookie': `refreshToken=${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        // Ambil dari structure data.access_token
        const newAccessToken = data.data?.access_token;

        if (newAccessToken) {
            accessToken = newAccessToken;
            
            // Lanjutkan request tapi set cookie baru di header response
            const response = NextResponse.next();
            response.cookies.set('accessToken', newAccessToken, {
                httpOnly: false,
                path: '/',
                maxAge: 60 * 15,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });
            return response;
        }
      }
    } catch (error) {
      console.error('Middleware refresh error:', error);
    }
  }
  // ---------------------------------

  const isAuthenticated = !!accessToken; // Kita anggap authenticated hanya jika accessToken valid/baru direfresh

  // Logic Redirect standar kamu (tidak berubah)
  if (isAuthPage && isAuthenticated) {
     // ... logic redirect dashboard kamu ...
     if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
     // dst...
  }

  if ((pathname.startsWith('/admin') || pathname.startsWith('/sekolah') || pathname.startsWith('/sppg')) && !pathname.includes('login')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // ... logic cek role kamu ...
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/sekolah/:path*', '/sppg/:path*'],
};