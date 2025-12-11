// File: src/app/api/scan-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Proxy Upload: Menerima request dari Frontend...");

    // 1. Ambil data file (FormData) yang dikirim dari HP
    const formData = await req.formData();
    
    // 2. Ambil token Authorization yang dikirim dari Frontend
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 3. Teruskan (Forward) ke Backend Asli
    // Kita lakukan ini di Server Next.js, jadi tidak akan kena CORS
    const backendRes = await fetch("https://api.inkluzi.my.id/api/v1/school/food-scans", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        // PENTING: JANGAN set 'Content-Type': 'multipart/form-data' secara manual.
        // Biarkan fetch yang otomatis membuat boundary-nya.
      },
      body: formData,
    });

    console.log("📡 Backend Res Status:", backendRes.status);

    // 4. Ambil respon dari backend
    const data = await backendRes.json();

    // 5. Kembalikan respon dari backend ke Frontend (HP)
    return NextResponse.json(data, { status: backendRes.status });

  } catch (error: any) {
    console.error("❌ Proxy Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada proxy server: " + error.message },
      { status: 500 }
    );
  }
}