import { getCookie, refreshAccessToken } from './auth'; 

// Default tetap ke proxy
export const BASE_URL = "/api/proxy";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  let url = "";

  // LOGIC BARU:
  // Jika endpoint dimulai dengan "http", gunakan langsung (Bypass Proxy)
  // Jika tidak, tempelkan BASE_URL (Pakai Proxy)
  if (endpoint.startsWith("http")) {
    url = endpoint;
  } else {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    url = `${BASE_URL}${path}`;
  }

  let token = getCookie('accessToken');

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Penting: Jangan set Content-Type manual untuk FormData
  if (options.body && options.body instanceof FormData) {
      // Biarkan browser set boundary otomatis
  } else {
      headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(url, { ...options, headers });

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
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${retryToken}`,
      };
      return fetch(url, { ...options, headers: newHeaders });
    }
  }

  return response;
};