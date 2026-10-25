import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/courses/:courseId — chi tiết
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/courses/${courseId}`);
}

// PATCH /api/courses/:courseId — cập nhật
export async function PATCH(request: Request, { params }: Params) {
    const { courseId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/courses/${courseId}`, { method: "PATCH", body });
}

// DELETE /api/courses/:courseId — xoá
export async function DELETE(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/courses/${courseId}`, { method: "DELETE" });
}