import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log("🏁 [SERVER LOG] Menerima Request Refresh Token di Route Handler");
  
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    console.error("❌ [SERVER LOG] Refresh Token TIDAK DITEMUKAN di Cookies");
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  console.log(`ℹ️ [SERVER LOG] Refresh Token ditemukan (awal): ${refreshToken.substring(0, 10)}...`);

  try {
    console.log("📡 [SERVER LOG] Mengirim request ke Backend API Inkluzi...");
    
    const res = await fetch("https://api.inkluzi.my.id/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store'
    });

    console.log(`📡 [SERVER LOG] Status dari Backend API: ${res.status}`);

    if (!res.ok) {
        const errText = await res.text();
        console.error(`❌ [SERVER LOG] Backend menolak refresh: ${errText}`);
        throw new Error(`Backend refused refresh: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ [SERVER LOG] Backend memberikan data baru:", JSON.stringify(data).substring(0, 100) + "...");

    const newAccessToken = data.data.access_token;
    const newRefreshToken = data.data.refresh_token;

    const response = NextResponse.json(
      { 
        success: true,
        data: { access_token: newAccessToken }
      },
      { status: 200 }
    );

    // Set Cookie Access Token
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: false, 
      path: "/",
      maxAge: 60 * 15, // 15 Menit
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Set Cookie Refresh Token (Jika ada rotasi)
    if (newRefreshToken) {
      console.log("🔄 [SERVER LOG] Update Refresh Token cookie...");
      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, 
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;

  } catch (error: any) {
    console.error("🚨 [SERVER LOG] Exception Total:", error.message);
    
    const response = NextResponse.json({ message: "Refresh failed" }, { status: 401 });
    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");
    return response;
  }
}