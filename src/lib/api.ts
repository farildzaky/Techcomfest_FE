import { getCookie, refreshAccessToken } from './auth'; 

export const BASE_URL = process.env.NODE_ENV === 'production' 
  ? "/api/proxy" 
  : "https://api.inkluzi.my.id/api/v1";

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
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  let token = getCookie('accessToken');

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && options.body instanceof FormData) {
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