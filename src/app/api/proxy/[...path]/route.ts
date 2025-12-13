import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

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

    console.log(`[PROXY] ${request.method} ${targetUrl}`);
    console.log(`[PROXY] Header Token: ${authHeader ? 'YES' : 'NO'} | Cookie Token: ${cookieToken ? 'YES' : 'NO'}`);
    console.log(`[PROXY] Using Token: ${accessToken ? accessToken.substring(0, 30) + '...' : 'NONE'}`);

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

        console.log(`[PROXY] Response status: ${res.status}`);

        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        console.error("[PROXY] Error:", error);
        return NextResponse.json({ message: "Proxy Error" }, { status: 500 });
    }
}