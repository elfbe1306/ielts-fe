import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ courseId: string; userId: string }> };

// PATCH /api/courses/:courseId/members/:userId — update member
export async function PATCH(request: Request, { params }: Params) {
    const { courseId, userId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/courses/${courseId}/members/${userId}`, { method: "PATCH", body });
}

// DELETE /api/courses/:courseId/members/:userId — delete member
export async function DELETE(_request: Request, { params }: Params) {
    const { courseId, userId } = await params;
    return proxyToBackend(`/api/courses/${courseId}/members/${userId}`, { method: "DELETE" });
}