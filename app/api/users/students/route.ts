import { proxyToBackend } from "@/lib/api/server";

// POST /api/users/students - create student account
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/users/students", { method: "POST", body });
}

// GET /api/users/students - get all students
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/users/students${search}`);
}