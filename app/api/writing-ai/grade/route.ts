import { proxyToBackend } from "@/lib/api/server";

// POST /api/writing-ai/grade
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/writing-ai/grade", { method: "POST", body });
}