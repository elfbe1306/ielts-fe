import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/courses/enrolled/{courseId}/week-sections — list week sections of a course
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/courses/enrolled/${courseId}/week-sections`, { method: "GET" });
}
