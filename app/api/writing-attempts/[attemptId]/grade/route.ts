import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ attemptId: string }> };

// POST /api/writing-attempts/:attemptId/grade — save grade + feedback, mark attempt as GRADED
export async function POST(request: Request, { params }: Params) {
    const { attemptId } = await params;
    const body = await request.text();
    return proxyToBackend(`/api/writing-attempts/${attemptId}/grade`, { method: "POST", body });
}