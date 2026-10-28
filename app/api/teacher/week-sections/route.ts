import { proxyToBackend } from "@/lib/api/server";

// POST - /api/teacher/week-sections - tạo 
export async function POST(request: Request) {
    const body = await request.text();
    return proxyToBackend("/api/teacher/week-sections", { method: "POST", body })
}