export const ROUTES = {
    landing: "/",
    signIn: "/sign-in",

    dashboard: "/dashboard",

    practices: {
        root: "/practices",
        listening: "/practices/listening",
        reading: "/practices/reading",
        writing: "/practices/writing",
        speaking: "/practices/speaking",
    },

    courses: "/courses",
    courseDetail: (courseId: string) => `/courses/${courseId}`,
    writingAssignment: (courseId: string, assignmentId: string) => `/courses/${courseId}/writing-assignments/${assignmentId}`,

    students: "/students",

    questionBank: {
        root: "/question-bank",
        listening: "/question-bank/listening",
        reading: "/question-bank/reading",
        writing: "/question-bank/writing",
        speaking: "/question-bank/speaking",
    },

    users: "/users",
} as const;

export const PUBLIC_PATHS: readonly string[] = [ROUTES.landing, ROUTES.signIn];