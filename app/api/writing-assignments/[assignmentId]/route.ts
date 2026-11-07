import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ assignmentId: string }> };

// PATCH /api/writing-assignments/:assignmentId — update writing assignment
export async function PATCH(request: Request, { params }: Params) {
    const { assignmentId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/writing-assignments/${assignmentId}`, { method: "PATCH", body });
}

// DELETE /api/writing-assignments/:assignmentId — delete writing assignment
export async function DELETE(_request: Request, { params }: Params) {
    const { assignmentId } = await params;
    return proxyToBackend(`/api/writing-assignments/${assignmentId}`, { method: "DELETE" });
}