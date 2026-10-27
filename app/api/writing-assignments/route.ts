import { proxyToBackend } from "@/lib/api/server";

// POST /api/writing-assignments - create
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/writing-assignments", { method: "POST", body });
}