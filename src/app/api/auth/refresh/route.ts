import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    console.error("❌ No refresh token found in cookies");
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  console.log("🔄 Attempting refresh with token:", refreshToken.substring(0, 20) + "...");

  try {
    const res = await fetch("https://api.inkluzi.my.id/api/v1/auth/refresh", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        refresh_token: refreshToken 
      }),
    });

    console.log("📡 Backend response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Backend refresh error:", res.status, errorText);
      throw new Error(`Backend refused refresh: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ Refresh successful", data);
    
    if (!data.success || !data.data) {
      console.error("❌ Invalid response structure:", data);
      throw new Error("Invalid response from backend");
    }

    const newAccessToken = data.data.access_token;
    const newRefreshToken = data.data.refresh_token;

    const response = NextResponse.json(
      { accessToken: newAccessToken },
      { status: 200 }
    );

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: false, 
      path: "/",
      maxAge: 60 * 15, 
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    if (newRefreshToken) {
      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, 
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    
    const response = NextResponse.json(
      { message: "Refresh failed" },
      { status: 401 }
    );
    
    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");
    response.cookies.delete("userRole");

    return response;
  }
}