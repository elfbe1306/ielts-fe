import { proxyToBackend } from "@/lib/api/server";

// POST /api/writing-ai/corrections
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/writing-ai/corrections", { method: "POST", body });
}