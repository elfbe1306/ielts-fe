import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ userId: string }> };

// PATCH /api/students/:userId — update student account
export async function PATCH(request: Request, { params }: Params) {
    const { userId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/students/${userId}`, { method: "PATCH", body });
}

// DELETE /api/students/:userId — delete student account
export async function DELETE(_request: Request, { params }: Params) {
    const { userId } = await params;
    return proxyToBackend(`/api/students/${userId}`, { method: "DELETE" });
}