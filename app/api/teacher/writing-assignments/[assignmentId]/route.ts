import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ assignmentId: string }> };

// PATCH /api/teacher/writing-assignments/:assignmentId - update
export async function PATCH(request: Request, { params }: Params) {
    const { assignmentId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/teacher/writing-assignments/${assignmentId}`, { method: "PATCH", body });
}

// DELETE /api/teacher/writing-assignments/:assignmentId - delete
export async function DELETE(_request: Request, { params }: Params) {
    const { assignmentId } = await params;
    return proxyToBackend(`/api/teacher/writing-assignments/${assignmentId}`, { method: "DELETE" });
}