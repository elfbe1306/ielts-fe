import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string }> };

// GET /api/courses/:courseId/members — get all members of a course (staff + students)
export async function GET(_request: Request, { params }: Params) {
    const { courseId } = await params;
    return proxyToBackend(`/api/courses/${courseId}/members`);
}

// POST /api/courses/{courseId}/members — add an existing student account to the course
export async function POST(request: Request, { params }: Params) {
    const { courseId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/courses/${courseId}/members`, { method: "POST", body });
}