import { proxyToBackend } from "@/lib/api/server";

// GET /api/students — list students
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/students${search}`);
}

// POST /api/students — create student account
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/students", { method: "POST", body });
}