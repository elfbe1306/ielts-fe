import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/courses/{courseId}/week-sections — list week sections of a course
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/courses/${courseId}/week-sections`, { method: "GET" });
}

// POST /api/courses/{courseId}/week-sections — create week section
export async function POST(request: Request, { params }: Params) {
    const { courseId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/courses/${courseId}/week-sections`, { method: "POST", body });
}