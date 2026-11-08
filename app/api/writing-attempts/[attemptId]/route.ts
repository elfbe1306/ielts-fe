import { proxyToBackend } from "@/lib/api/server";

type Params = { params: Promise<{ attemptId: string }> };

// GET /api/writing-attempts/:attemptId — get writing attempt with content
export async function GET(_request: Request, { params }: Params) {
    const { attemptId } = await params;
    return proxyToBackend(`/api/writing-attempts/${attemptId}`);
}