import { proxyToBackend } from "@/lib/api/server";

// POST /api/week-sections — create week section
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/week-sections", { method: "POST", body });
}