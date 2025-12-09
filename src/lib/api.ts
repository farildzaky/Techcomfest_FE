import { getCookie, refreshAccessToken } from './auth';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // 1. Ambil token dari cookie
  let token = getCookie('accessToken');

  // 2. Siapkan header
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    // Jika token ada, tambahkan ke header Authorization
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;

  // 3. Coba request pertama
  let response = await fetch(url, { ...options, headers });

  // 4. Jika gagal karena Token Expired (401 Unauthorized)
  if (response.status === 401) {
    console.warn("⚠️ Access Token expired (15 menit habis). Mencoba refresh...");
    
    // 5. Panggil fungsi refresh token yang sudah Anda punya
    const newToken = await refreshAccessToken();

    if (newToken) {
      console.log("✅ Refresh berhasil. Mengulang request...");
      
      // 6. Update header dengan token baru
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };

      // 7. Ulangi request (Retry) dengan token baru
      response = await fetch(url, { ...options, headers: newHeaders });
    } else {
       console.error("❌ Refresh gagal. User harus login ulang.");
       // Redirect logic sudah ada di dalam refreshAccessToken
    }
  }

  return response;
};