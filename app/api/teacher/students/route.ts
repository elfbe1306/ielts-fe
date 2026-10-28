import { proxyToBackend } from "@/lib/api/server";

// POST /api/teacher/students - create student account
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/teacher/students", { method: "POST", body });
}

// GET /api/teacher/students - get all students
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/teacher/students${search}`);
}