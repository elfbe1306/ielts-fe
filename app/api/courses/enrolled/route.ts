import { proxyToBackend } from "@/lib/api/server";

// GET /api/courses/enrolled — get courses the student is enrolled in
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/courses/enrolled${search}`);
}