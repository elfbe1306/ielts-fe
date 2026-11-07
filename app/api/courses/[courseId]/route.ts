import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/courses/:courseId — get course by id
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/courses/${courseId}`);
}

// PATCH /api/courses/:courseId — update course
export async function PATCH(request: Request, { params }: Params) {
    const { courseId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/courses/${courseId}`, { method: "PATCH", body });
}

// DELETE /api/courses/:courseId — delete course
export async function DELETE(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/courses/${courseId}`, { method: "DELETE" });
}