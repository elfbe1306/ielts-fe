import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ weekSectionId: string }> };

// PATCH /api/week-sections/:weekSectionId — update week section
export async function PATCH(request: Request, { params }: Params) {
    const { weekSectionId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/week-sections/${weekSectionId}`, { method: "PATCH", body });
}

// DELETE /api/week-sections/:weekSectionId — delete week section
export async function DELETE(_request: Request, { params }: Params) {
    const { weekSectionId } = await params;
    return proxyToBackend(`/api/week-sections/${weekSectionId}`, { method: "DELETE" });
}