import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ questionId: string }> };

// PATCH /api/writing-questions/:questionId — update writing question (multipart)
export async function PATCH(request: Request, { params }: Params) {
    const { questionId } = await params;
    const formData = await request.formData();
    return proxyToBackend(`/api/writing-questions/${questionId}`, { method: "PATCH", body: formData });
}

// DELETE /api/writing-questions/:questionId — delete writing question
export async function DELETE(_request: Request, { params }: Params) {
    const { questionId } = await params;
    return proxyToBackend(`/api/writing-questions/${questionId}`, { method: "DELETE" });
}