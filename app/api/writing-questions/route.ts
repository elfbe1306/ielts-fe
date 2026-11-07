import { proxyToBackend } from "@/lib/api/server";

// GET /api/writing-questions — list writing questions
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/writing-questions${search}`);
}

// POST /api/writing-questions — create writing question (multipart)
export async function POST(request: Request) {
    const formData = await request.formData();
    return proxyToBackend("/api/writing-questions", { method: "POST", body: formData });
}