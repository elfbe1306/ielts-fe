import { proxyToBackend } from "@/lib/api/server";

// POST /api/writing-attempts — submit writing attempt
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/writing-attempts", { method: "POST", body });
}

// GET /api/writing-attempts?assignmentId=&userId= — list writing attempts
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/writing-attempts${search}`);
}