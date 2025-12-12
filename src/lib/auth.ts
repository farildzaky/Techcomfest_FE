import { BASE_URL } from "@/src/lib/api";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("🔍 [DEBUG AUTH] Gagal parse JWT:", e);
    return null;
  }
};

const isTokenExpired = (token: string) => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    console.log("🔍 [DEBUG AUTH] Token tidak valid atau tidak ada exp.");
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - currentTime;

  console.log(`🔍 [DEBUG AUTH] Sisa Waktu Token: ${timeLeft} detik`);

  return currentTime > (decoded.exp - 10);
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
};

export const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === 'undefined') return;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  console.log('🔄 [DEBUG AUTH] Memicu refreshAccessToken()...');

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    console.log(`🔄 [DEBUG AUTH] Status response refresh endpoint: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [DEBUG AUTH] Gagal Refresh di server: ${errorText}`);
      throw new Error("Refresh failed");
    }

    const resJson = await response.json();
    console.log("✅ [DEBUG AUTH] Sukses dapat JSON baru:", resJson);

    const newAccessToken = resJson.data?.access_token;

    if (!newAccessToken) {
      console.error("❌ [DEBUG AUTH] Token baru tidak ditemukan di response JSON!");
      throw new Error("No access token in response");
    }

    setCookie('accessToken', newAccessToken, 60 * 15);
    console.log("✅ [DEBUG AUTH] Token baru berhasil disimpan ke cookie client!");

    return newAccessToken;
  } catch (error) {
    console.error("❌ [DEBUG AUTH] Exception saat refresh:", error);

    document.cookie = "accessToken=; Max-Age=0; path=/;";
    document.cookie = "userRole=; Max-Age=0; path=/;";
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return null;
  }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = getCookie('accessToken');
  let needsRefresh = false;

  console.log(`🚀 [DEBUG AUTH] Request ke: ${url}`);

  if (!token) {
    console.warn("⚠️ [DEBUG AUTH] Token kosong di cookie.");
    needsRefresh = true;
  } else if (isTokenExpired(token)) {
    console.warn("⚠️ [DEBUG AUTH] Token terdeteksi EXPIRED secara lokal.");
    needsRefresh = true;
  }

  if (needsRefresh) {
    if (!isRefreshing) {
      isRefreshing = true;
      token = await refreshAccessToken();
      isRefreshing = false;
      if (token) onRefreshed(token);
    } else {
      console.log('⏳ [DEBUG AUTH] Menunggu antrian refresh...');
      token = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((newToken) => resolve(newToken));
      });
    }
  }

  if (!token) {
    console.error("❌ [DEBUG AUTH] Tidak ada token valid. Melempar error.");
    throw new Error('Session expired. Please login again.');
  }

  let finalUrl = url;
  if (!url.startsWith("http")) {
    const path = url.startsWith("/") ? url : `/${url}`;
    finalUrl = `${BASE_URL}${path}`;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  } as HeadersInit;

  console.log(`📡 [DEBUG AUTH] Sending fetch ke ${finalUrl}...`);
  let response = await fetch(finalUrl, { ...options, headers });
  console.log(`📡 [DEBUG AUTH] Response Status: ${response.status}`);

  if (response.status === 401 || response.status === 403) {
    console.warn(`⚠️ [DEBUG AUTH] Mendapat status ${response.status}. Mencoba refresh token ulang (Retry Logic)...`);

    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        console.log("🔁 [DEBUG AUTH] Retry request dengan token baru...");
        onRefreshed(newToken);
        return fetch(finalUrl, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
      } else {
        console.error("❌ [DEBUG AUTH] Retry gagal karena tidak dapat token baru.");
      }
    } else {
      const retryToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((newToken) => resolve(newToken));
      });
      if (retryToken) {
        console.log("🔁 [DEBUG AUTH] Retry request (from queue) dengan token baru...");
        return fetch(finalUrl, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${retryToken}` },
        });
      }
    }
  }

  return response;
};