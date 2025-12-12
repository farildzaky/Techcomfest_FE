import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    console.log("🚪 [LOGOUT] Processing logout request...");

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const accessToken = cookieStore.get("accessToken")?.value;

    // Call backend logout to invalidate refresh token
    if (refreshToken) {
        try {
            console.log("📡 [LOGOUT] Calling backend logout API...");
            const res = await fetch("https://api.inkluzi.my.id/api/v1/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken && { "Authorization": `Bearer ${accessToken}` })
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            console.log(`📡 [LOGOUT] Backend response: ${res.status}`);
        } catch (error) {
            console.error("⚠️ [LOGOUT] Backend logout failed:", error);
        }
    }

    // Create response
    const response = NextResponse.json(
        { success: true, message: "Logged out successfully" },
        { status: 200 }
    );

    // Delete ALL auth cookies
    console.log("🗑️ [LOGOUT] Clearing all cookies...");

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("userRole");

    // Also set expired cookies to ensure they're removed
    response.cookies.set("accessToken", "", {
        httpOnly: false,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });

    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });

    response.cookies.set("userRole", "", {
        httpOnly: false,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });

    console.log("✅ [LOGOUT] Logout complete!");
    return response;
}
