import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ userId: string }> };

// PATCH /api/users/students/:userId - update student account
export async function PATCH(request: Request, { params }: Params) {
    const { userId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/users/students/${userId}`, { method: "PATCH", body });
}

// DELETE /api/users/students/:userId - delete student account
export async function DELETE(_request: Request, { params }: Params) {
    const { userId } = await params;
    return proxyToBackend(`/api/users/students/${userId}`, { method: "DELETE" });
}