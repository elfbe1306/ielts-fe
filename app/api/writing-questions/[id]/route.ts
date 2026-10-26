import { errorResponse, proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/writing-questions/:id - update (multipart)
export async function PATCH(request: Request, { params }: Params) {
    const { id } = await params;

    let formData: FormData;

    try {
        formData = await request.formData();
    } catch {
        return errorResponse(400, "Bad Request", "Invalid form data.");
    }

    return proxyToBackend(`/api/writing-questions/${id}`, { method: "PATCH", body: formData });
}

// DELETE /api/writing-questions/:id - delete
export async function DELETE(_request: Request, { params }: Params) {
    const { id } = await params;
    return proxyToBackend(`/api/writing-questions/${id}`, { method: "DELETE" });
}