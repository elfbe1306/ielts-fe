import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/student/courses/:courseId/members — thành viên học viên được thấy (chỉ giáo viên, không có học viên khác)
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/student/courses/${courseId}/members`);
}