import { Role } from "@/types/auth-type";

export const ROUTES = {
    landing: "/",
    signIn: "/sign-in",

    admin: {
        dashboard: "/admin/dashboard"
    },
    teacher: {
        dashboard: "/teacher/dashboard"
    },
    student: {
        dashboard: "/student/dashboard"
    }
} as const;

export const ROLE_AREA: Record<Role, string> = {
    ADMIN: "/admin",
    TEACHER: "/teacher",
    STUDENT: "/student",
};

export const ROLE_HOME: Record<Role, string> = {
    ADMIN: ROUTES.admin.dashboard,
    TEACHER: ROUTES.teacher.dashboard,
    STUDENT: ROUTES.student.dashboard
};