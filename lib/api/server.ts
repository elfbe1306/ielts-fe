import "server-only";
import { cookies } from "next/headers";

type BackendInit = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

export type ErrorResponse = {
    status: number;
    error: string;
    message: string;
    timestamp: string;
};

export function errorResponse(status: number, error: string, message: string) {
    return Response.json(
        {
            status,
            error,
            message,
            timestamp: new Date().toISOString(),
        } satisfies ErrorResponse,
        { status }
    );
}

export async function backendFetch(path: string, init: BackendInit = {}): Promise<Response> {
    const token = (await cookies()).get("accessToken")?.value;
    const hasJsonBody = init.body !== undefined && !(init.body instanceof FormData);

    return fetch(`${process.env.BACKEND_API_URL}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init.headers,
        },
    });
}

export async function proxyToBackend(path: string, init: BackendInit = {}): Promise<Response> {
    let res: Response;
    let raw: string;

    try {
        res = await backendFetch(path, init);
        raw = await res.text();
    } catch {
        return errorResponse(503, "Service Unavailable", "Unable to reach the server. Please try again later.");
    }

    if (!raw) {
        return res.ok
            ? new Response(null, { status: res.status })
            : errorResponse(res.status, "Request Failed", "Request failed.");
    }

    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        console.error(`[proxyToBackend] Non-JSON response from ${path}:`, res.status, raw);
        return errorResponse(502, "Unexpected Response", "Unexpected response from server.");
    }

    return Response.json(data, { status: res.status });
}