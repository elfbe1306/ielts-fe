import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { User } from "@/types/auth-type";
import { backendFetch } from "./api/server";

export const getCurrentUser = cache(async (): Promise<User | null> => {
    const token = (await cookies()).get("accessToken")?.value;
    if (!token) return null;

    try {
        const res = await backendFetch("/api/users/me");
        if (!res.ok) return null;
        return (await res.json()) as User;
    } catch {
        return null;
    }
});