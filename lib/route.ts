import { Role } from "@/types/auth-type";

export const ROUTES = {
    landing: "/",
    signIn: "/sign-in",

    admin: {
        dashboard: "/admin/dashboard",
        users: "/admin/users"
    },
    teacher: {
        dashboard: "/teacher/dashboard",
        courses: "/teacher/courses",
        courseDetail: (courseId: string) => `/teacher/courses/${courseId}`,
        writingAssignment: (courseId: string, assignmentId: string) => `/teacher/courses/${courseId}/writing-assignments/${assignmentId}`,
        students: "/teacher/students",
        questionBank: {
            root: "/teacher/question-bank",
            listening: "/teacher/question-bank/listening",
            reading: "/teacher/question-bank/reading",
            writing: "/teacher/question-bank/writing",
            speaking: "/teacher/question-bank/speaking",
        },
    },
    student: {
        dashboard: "/student/dashboard",
        courses: "/student/courses",
        courseDetail: (courseId: string) => `/student/courses/${courseId}`,
        writingAssignment: (courseId: string, assignmentId: string) => `/student/courses/${courseId}/writing-assignments/${assignmentId}`
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