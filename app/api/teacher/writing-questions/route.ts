import { errorResponse, proxyToBackend } from "@/lib/api/server";

// GET /api/teacher/writing-questions - list
export async function GET(request: Request) {
    const { search } = new URL(request.url);
    return proxyToBackend(`/api/teacher/writing-questions${search}`);
}

// POST /api/teacher/writing-questions - create (multipart: có thể kèm ảnh)
export async function POST(request: Request) {
    let formData: FormData;

    try {
        formData = await request.formData();
    } catch {
        return errorResponse(400, "Bad Request", "Invalid form data.");
    }

    return proxyToBackend("/api/teacher/writing-questions", { method: "POST", body: formData });
}