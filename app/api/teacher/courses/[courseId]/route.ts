import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/teacher/courses/:courseId — chi tiết
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/teacher/courses/${courseId}`);
}

// PATCH /api/teacher/courses/:courseId — cập nhật
export async function PATCH(request: Request, { params }: Params) {
    const { courseId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/teacher/courses/${courseId}`, { method: "PATCH", body });
}

// DELETE /api/teacher/courses/:courseId — xoá
export async function DELETE(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/teacher/courses/${courseId}`, { method: "DELETE" });
}