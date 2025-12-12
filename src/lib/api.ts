import { getCookie, setCookie, refreshAccessToken } from './auth';

export const BASE_URL = "/api/proxy";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  let url = "";

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

  if (options.body && options.body instanceof FormData) {
  } else {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    console.log(`🔄 [API] Got ${response.status}, attempting token refresh...`);

    let newToken: string | null = null;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();

      try {
        newToken = await refreshPromise;
        console.log("✅ [API] Refresh completed, new token:", newToken ? "YES" : "NO");

        if (newToken) {
          setCookie('accessToken', newToken, 60 * 15);
          console.log("✅ [API] Cookie updated with new token");
        }
      } catch (error) {
        console.error("❌ [API] Refresh error:", error);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    } else {
      console.log("⏳ [API] Already refreshing, waiting...");
      newToken = await refreshPromise;
    }

    if (newToken) {
      console.log("🔁 [API] Retrying request with new token...");

      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };

      return fetch(url, { ...options, headers: newHeaders });
    } else {
      console.error("❌ [API] No token available for retry, redirecting to login...");
    }
  }

  return response;
};