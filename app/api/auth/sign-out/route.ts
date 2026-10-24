import { cookies } from "next/headers";

// POST - /api/auth/sign-out
export async function POST() {
    const cookieStore = await cookies();

    cookieStore.delete("accessToken");

    return new Response(null, { status: 204 });
}