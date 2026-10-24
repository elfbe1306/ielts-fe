import { User } from "@/types/auth-type";
import { http } from "./http";

export const authApi = {
    signIn: (code: string) => http.post<User>("/api/auth/google", { code }),
    signOut: () => http.post<void>("/api/auth/sign-out"),
}