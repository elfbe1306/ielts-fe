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
    const isFormData = init.body instanceof FormData;

    return fetch(`${process.env.BACKEND_API_URL}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init.headers,
        },
    });
}