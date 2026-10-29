import { proxyToBackend } from "@/lib/api/server";

// GET /api/student/courses — list
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/student/courses${search}`);
}