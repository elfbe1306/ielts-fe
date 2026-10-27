import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ assignmentId: string }> };

// GET /api/writing-assignments/:assignmentId - detail
export async function GET(_request: Request, { params }: Params) {
    const { assignmentId } = await params;
    return proxyToBackend(`/api/writing-assignments/${assignmentId}`);
}

// PATCH /api/writing-assignments/:assignmentId - update
export async function PATCH(request: Request, { params }: Params) {
    const { assignmentId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/writing-assignments/${assignmentId}`, { method: "PATCH", body });
}

// DELETE /api/writing-assignments/:assignmentId - delete
export async function DELETE(_request: Request, { params }: Params) {
    const { assignmentId } = await params;
    return proxyToBackend(`/api/writing-assignments/${assignmentId}`, { method: "DELETE" });
}