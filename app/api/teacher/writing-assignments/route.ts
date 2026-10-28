import { proxyToBackend } from "@/lib/api/server";

// POST /api/teacher/writing-assignments - create
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/teacher/writing-assignments", { method: "POST", body });
}