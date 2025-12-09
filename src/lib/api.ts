import { getCookie, refreshAccessToken } from './auth'; // Pastikan path import ini sesuai dengan struktur folder Anda

// =================================================================
// 1. KONFIGURASI BASE URL (SOLUSI CORS VERCEL)
// =================================================================
// Ini otomatis memilih jalur:
// - Di Vercel (Production): Pakai "/api/proxy" agar lolos CORS.
// - Di Localhost: Pakai URL asli backend.
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? "/api/proxy" 
  : "https://api.inkluzi.my.id/api/v1"; 

// =================================================================
// 2. SISTEM ANTREAN (LOCKING) UNTUK REFRESH TOKEN
// =================================================================
// Variable ini mencegah aplikasi melakukan refresh token berkali-kali
// jika ada banyak request API yang gagal bersamaan.
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// =================================================================
// 3. FUNGSI UTAMA FETCH
// =================================================================
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // Normalisasi Endpoint: Pastikan diawali dengan "/"
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Gabungkan Base URL dengan Endpoint
  const url = `${BASE_URL}${path}`;

  // Ambil token saat ini
  let token = getCookie('accessToken');

  // Siapkan Header Authorization
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;

  // --- REQUEST PERTAMA ---
  let response = await fetch(url, { ...options, headers });

  // --- JIKA TOKEN MATI (401 Unauthorized) ---
  if (response.status === 401) {
    if (!isRefreshing) {
      // 1. Kunci proses refresh (hanya request pertama yang masuk sini)
      isRefreshing = true;
      
      try {
        console.log("🔄 Access Token expired. Refreshing...");
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          // Jika sukses, kabari semua request yang mengantre
          onRefreshed(newToken);
        } else {
           // Jika refresh gagal, biarkan user logout (biasanya dihandle di refreshAccessToken)
           isRefreshing = false;
        }
      } catch (error) {
        isRefreshing = false;
        console.error("❌ Refresh process error:", error);
      }
    }

    // 2. Buat request lain menunggu (Queueing) sampai refresh selesai
    const retryToken = await new Promise<string>((resolve) => {
      subscribeTokenRefresh((newToken) => resolve(newToken));
    });

    // 3. Ulangi request (Retry) dengan token baru
    if (retryToken) {
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${retryToken}`,
      };
      return fetch(url, { ...options, headers: newHeaders });
    }
  }

  return response;
};