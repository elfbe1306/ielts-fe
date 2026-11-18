import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string; weekSectionId: string }> };

// POST /api/courses/:courseId/week-sections/:weekSectionId/writing-assignments — create writing assignment
export async function POST(request: Request, { params }: Params) {
    const { courseId, weekSectionId } = await params;
    const body = await request.text();

    return proxyToBackend(`/api/courses/${courseId}/week-sections/${weekSectionId}/writing-assignments`, { method: "POST", body });
}