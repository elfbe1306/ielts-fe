import { proxyToBackend } from "@/lib/api/server";

// POST - /api/week-sections - tạo 
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/week-sections", { method: "POST", body })
}