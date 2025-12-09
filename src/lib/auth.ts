// ==================== AUTH UTILITIES ====================
// Single source of truth untuk semua auth logic

// --- 1. STATE & QUEUE ---
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// --- 2. COOKIE HELPERS ---
export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
};

// --- 3. REFRESH TOKEN ---
export const refreshAccessToken = async (): Promise<string | null> => {
  console.log('🔄 [Auth] Attempting to refresh access token...');
  
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: 'include', // Kirim cookies (refreshToken HttpOnly)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Auth] Refresh failed:", response.status, errorText);
      throw new Error("Internal refresh failed");
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    console.log('✅ [Auth] Refresh successful, new token received');
    return newAccessToken;
  } catch (error) {
    console.error("❌ [Auth] Session expired. Logging out...", error);
    
    // Hapus cookies client-side
    document.cookie = "accessToken=; Max-Age=0; path=/;";
    document.cookie = "userRole=; Max-Age=0; path=/;";
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return null;
  }
};

// --- 4. FETCH WITH AUTH ---
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = getCookie('accessToken');

  // Kalau token kosong, coba refresh dulu
  if (!token) {
    console.log('⚠️ [Auth] No access token found, attempting refresh...');
    
    if (!isRefreshing) {
      isRefreshing = true;
      token = await refreshAccessToken();
      isRefreshing = false;
      if (token) onRefreshed(token);
    } else {
      // Tunggu refresh yang sedang berjalan
      console.log('⏳ [Auth] Waiting for ongoing refresh...');
      token = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((newToken) => resolve(newToken));
      });
    }
  }

  // Kalau masih nggak ada token setelah refresh, stop
  if (!token) {
    throw new Error('No access token available');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  } as HeadersInit;

  let response = await fetch(url, { 
    ...options, 
    headers,
    credentials: 'include', // Kirim cookies
  });

  // Kalau 401, coba refresh dan retry
  if (response.status === 401) {
    console.warn("⚠️ [Auth] Got 401, access token expired. Trying refresh...");

    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onRefreshed(newToken);
          
          console.log('🔁 [Auth] Retrying request with new token...');
          // Retry request dengan token baru
          return fetch(url, {
            ...options,
            headers: { ...headers, Authorization: `Bearer ${newToken}` },
            credentials: 'include',
          });
        }
      } catch (error) {
        isRefreshing = false;
        throw error;
      }
    }

    // Tunggu refresh yang sedang berjalan, lalu retry
    return new Promise<Response>((resolve) => {
      subscribeTokenRefresh((newToken) => {
        console.log('🔁 [Auth] Retrying request after queue...');
        const newHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
        resolve(fetch(url, { 
          ...options, 
          headers: newHeaders,
          credentials: 'include',
        }));
      });
    });
  }

  return response;
};