import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string; weekSectionId: string }> };

// PATCH /api/courses/:courseId/week-sections/:weekSectionId — update week section
export async function PATCH(request: Request, { params }: Params) {
    const { courseId, weekSectionId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/courses/${courseId}/week-sections/${weekSectionId}`, { method: "PATCH", body });
}

// DELETE /api/courses/:courseId/week-sections/:weekSectionId — delete week section
export async function DELETE(_request: Request, { params }: Params) {
    const { courseId, weekSectionId } = await params;
    return proxyToBackend(`/api/courses/${courseId}/week-sections/${weekSectionId}`, { method: "DELETE" });
}