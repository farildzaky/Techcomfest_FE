import { getCookie, refreshAccessToken } from './auth'; 

// =================================================================
// 1. KONFIGURASI BASE URL
// =================================================================
export const BASE_URL = process.env.NODE_ENV === 'production' 
  ? "/api/proxy" 
  : "https://api.inkluzi.my.id/api/v1";

// =================================================================
// 2. SISTEM ANTREAN (LOCKING)
// =================================================================
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
// 3. FUNGSI UTAMA FETCH (DIPERBAIKI)
// =================================================================
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // Normalisasi Endpoint
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  let token = getCookie('accessToken');

  // --- PERBAIKAN HEADER ---
  // Kita ubah inisialisasi headers agar tidak langsung hardcode JSON
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // LOGIKA PENTING:
  // Hanya tambahkan 'Content-Type: application/json' jika body BUKAN FormData.
  // Jika ini adalah upload file (FormData), biarkan browser yang set Content-Type 
  // secara otomatis (karena butuh boundary string).
  if (options.body && options.body instanceof FormData) {
      // Jangan set Content-Type, biarkan browser menanganinya
  } else {
      // Default ke JSON untuk request biasa
      headers['Content-Type'] = 'application/json';
  }

  // --- REQUEST PERTAMA ---
  let response = await fetch(url, { ...options, headers });

  // --- JIKA TOKEN MATI (401 Unauthorized) ---
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        console.log("🔄 Access Token expired. Refreshing...");
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onRefreshed(newToken);
        } else {
           isRefreshing = false;
        }
      } catch (error) {
        isRefreshing = false;
        console.error("❌ Refresh process error:", error);
      }
    }

    const retryToken = await new Promise<string>((resolve) => {
      subscribeTokenRefresh((newToken) => resolve(newToken));
    });

    if (retryToken) {
      // Update header Authorization dengan token baru
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${retryToken}`,
      };
      // Retry request
      return fetch(url, { ...options, headers: newHeaders });
    }
  }

  return response;
};