import { proxyToBackend } from "@/lib/api/server";

type Context = { params: Promise<{ path: string[] }> };

async function handler(request: Request, { params }: Context) {
    const { path } = await params;
    const { search } = new URL(request.url);

    const backendPath = `/api/${path.map(encodeURIComponent).join("/")}${search}`;

    let body: string | FormData | undefined;

    if (request.method !== "GET" && request.method !== "HEAD") {
        const contentType = request.headers.get("content-type") ?? "";

        if (contentType.startsWith("multipart/form-data")) {
            body = await request.formData();
        } else {
            body = (await request.text()) || undefined;
        }
    }

    return proxyToBackend(backendPath, { method: request.method, body });
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as PATCH,
    handler as DELETE,
};