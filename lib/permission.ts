import { Role } from "@/types/auth-type";

export const ACCESS = {
    courses: ["TEACHER", "STUDENT"],
    questionBank: ["TEACHER"],
    students: ["TEACHER"],
    users: ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export function canAccess(role: Role, area: keyof typeof ACCESS): boolean {
    return (ACCESS[area] as readonly Role[]).includes(role);
}