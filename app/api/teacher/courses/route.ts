import { proxyToBackend } from "@/lib/api/server";

// GET /api/teacher/courses — list
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/teacher/courses${search}`);
}

// POST /api/teacher/courses — create
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/teacher/courses", { method: "POST", body });
}