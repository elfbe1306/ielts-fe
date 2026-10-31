import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/teacher/courses/:courseId/members — toàn bộ thành viên (giáo viên + học viên)
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/teacher/courses/${courseId}/members`);
}