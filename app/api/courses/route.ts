import { proxyToBackend } from "@/lib/api/server";

// GET /api/courses — list
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/courses${search}`);
}

// POST /api/courses — create
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/courses", { method: "POST", body });
}