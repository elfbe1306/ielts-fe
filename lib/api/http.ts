export class ApiError extends Error {
    constructor(public code: string, public status: number) {
        super(code);
    }
}

function toBody(data: unknown): BodyInit | undefined {
    if (data === undefined) return undefined;
    if (data instanceof FormData) return data;
    return JSON.stringify(data);
}

async function request<T>(url: string, init: RequestInit = {}) : Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !(init.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    let res: Response;
    try {
        res = await fetch(url, { ...init, headers });
    } catch {
        throw new ApiError("NETWORK_ERROR", 0);
    }

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
        throw new ApiError(data?.error ?? data?.code ?? "UNKNOWN_ERROR", res.status);
    }

    return data as T;
}

export const http = {
    get: <T>(url: string) => request<T>(url, { method: "GET" }),
    post: <T>(url: string, data: unknown) => request<T>(url, { method: "POST", body: toBody(data) }),
    patch: <T>(url: string, data: unknown) => request<T>(url, { method: "PATCH", body: toBody(data) }),
    delete: <T>(url: string) => request<T>(url, { method: "DELETE" })
};