import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

// Use Edge runtime is optional - Node runtime handles larger bodies
// export const runtime = 'nodejs'; // default

// Disable body size limit for file uploads in App Router
export const dynamic = 'force-dynamic';

// For App Router: maximum request body size (in bytes) - 10MB
export const maxDuration = 60;

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const resolvedParams = await params;
    return handleProxy(request, resolvedParams);
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
    const path = params.path.join("/");
    const queryString = request.nextUrl.search;
    const targetUrl = `https://api.inkluzi.my.id/api/v1/${path}${queryString}`;

    const cookieStore = await cookies();

    let accessToken = "";

    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.split("Bearer ")[1];
    }

    const cookieToken = cookieStore.get("accessToken")?.value;
    if (cookieToken) {
        accessToken = cookieToken;
    }

    const contentType = request.headers.get("Content-Type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    console.log(`[PROXY] ${request.method} ${targetUrl}`);
    console.log(`[PROXY] Content-Type: ${contentType} | isFormData: ${isFormData}`);
    console.log(`[PROXY] Header Token: ${authHeader ? 'YES' : 'NO'} | Cookie Token: ${cookieToken ? 'YES' : 'NO'}`);
    console.log(`[PROXY] Using Token: ${accessToken ? accessToken.substring(0, 30) + '...' : 'NONE'}`);

    const headers: Record<string, string> = {};

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Jika bukan FormData, set Content-Type ke JSON
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    try {
        let body: BodyInit | undefined;

        if (request.method !== "GET" && request.method !== "HEAD") {
            if (isFormData) {
                // Forward FormData as-is
                body = await request.formData();
            } else {
                body = await request.text();
            }
        }

        const res = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
            cache: "no-store",
        });

        const data = await res.json();

        console.log(`[PROXY] Response status: ${res.status}`);

        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        console.error("[PROXY] Error:", error);
        return NextResponse.json({ message: "Proxy Error" }, { status: 500 });
    }
}