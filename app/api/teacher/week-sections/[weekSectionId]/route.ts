import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ weekSectionId: string }> };

// PATCH /api/teacher/week-sections/:weekSectionId - cập nhật
export async function PATCH(request: Request, { params }: Params) {
    const { weekSectionId } =  await params;
    const body = await request.text();
    return proxyToBackend(`/api/teacher/week-sections/${weekSectionId}`, { method: "PATCH", body });
}

// DELETE /api/teacher/week-sections/:weekSectionId - xoá
export async function DELETE(_request: Request, { params }: Params) {
    const { weekSectionId } = await params;
    return proxyToBackend(`/api/teacher/week-sections/${weekSectionId}`, { method: "DELETE" });
}