import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 1. Mencegah Caching (Wajib untuk Auth)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // --- LOG: Cek Keberadaan Token ---
  if (!refreshToken) {
    console.error("❌ [Refresh Route] No refresh token found in cookies");
    return NextResponse.json(
      { message: "No refresh token" }, 
      { status: 401 }
    );
  }

  // --- LOG: Mulai Proses (Truncate token agar log tidak kepanjangan/aman) ---
  console.log("🔄 [Refresh Route] Attempting refresh with token:", refreshToken.substring(0, 15) + "...");

  try {
    // 2. Fetch ke Backend Eksternal
    const res = await fetch("https://api.inkluzi.my.id/api/v1/auth/refresh", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        refresh_token: refreshToken 
      }),
      cache: 'no-store' // Cegah fetch menyimpan cache response lama
    });

    // --- LOG: Status dari Backend ---
    console.log(`📡 [Refresh Route] Backend response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ [Refresh Route] Backend refresh error body:", errorText);
      throw new Error(`Backend refused refresh: ${res.status}`);
    }

    const data = await res.json();
    
    // 3. Validasi Struktur Data
    if (!data.success || !data.data) {
      console.error("❌ [Refresh Route] Invalid response structure:", JSON.stringify(data, null, 2));
      throw new Error("Invalid response structure from backend");
    }

    // --- LOG: Sukses ---
    console.log("✅ [Refresh Route] Refresh successful! New tokens received.");

    const newAccessToken = data.data.access_token;
    const newRefreshToken = data.data.refresh_token;

    // 4. Return Response dengan format yang SAMA dengan Backend Asli
    // Agar frontend (api.ts) bisa membaca data.data.access_token
    const response = NextResponse.json(
      { 
        success: true,
        message: "Token refreshed successfully",
        data: {
            access_token: newAccessToken,
            // sertakan refresh token di body jika frontend butuh debug, 
            // tapi yang terpenting set-cookie di bawah
        }
      },
      { status: 200 }
    );

    // 5. Set Cookie Access Token (Bisa dibaca JS client-side: httpOnly false)
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: false, 
      path: "/",
      maxAge: 60 * 15, // 15 Menit
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // 6. Set Cookie Refresh Token Baru (Aman: httpOnly true)
    if (newRefreshToken) {
      console.log("🔄 [Refresh Route] Rotating refresh token cookie...");
      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 Hari
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;

  } catch (error: any) {
    // --- LOG: Error Catch ---
    console.error("🚨 [Refresh Route] Critical Error:", error.message || error);
    
    const response = NextResponse.json(
      { message: "Refresh failed" },
      { status: 401 }
    );
    
    // Bersihkan cookie jika gagal agar user login ulang
    console.log("🧹 [Refresh Route] Cleaning up cookies due to failure...");
    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");
    response.cookies.delete("userRole");

    return response;
  }
}