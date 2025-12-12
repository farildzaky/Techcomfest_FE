import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    return handleProxy(request, params);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
    return handleProxy(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
    return handleProxy(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
    return handleProxy(request, params);
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
    const path = params.path.join("/");
    const queryString = request.nextUrl.search;
    const targetUrl = `https://api.inkluzi.my.id/api/v1/${path}${queryString}`;

    // 1. AMBIL TOKEN: Prioritaskan Header 'Authorization' dari Client (untuk kasus Retry)
    // Baru kalau tidak ada, ambil dari Cookie.
    let accessToken = "";
    
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.split("Bearer ")[1];
    } else {
        const cookieStore = await cookies();
        accessToken = cookieStore.get("accessToken")?.value || "";
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
        const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined;

        const res = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
            cache: "no-store",
        });

        const data = await res.json();
        
        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        return NextResponse.json({ message: "Proxy Error" }, { status: 500 });
    }
}