import { User } from "@/types/auth-type";
import { http } from "./http";

export const AuthApi = {
    signIn: (code: string) => http.post<User>("/api/auth/google", { code })
}