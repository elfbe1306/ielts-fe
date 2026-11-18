// === UI Type ===

export const STATUS_STYLE: Record<CourseStatus, string> = {
    UPCOMING: "bg-accent-bg text-accent-active",
    ACTIVE: "bg-highlight-bg text-highlight-fg border border-highlight",
    ENDED: "bg-surface text-muted border border-border",
};

export const STATUS_TEXT_STYLE: Record<CourseStatus, string> = {
    UPCOMING: "text-accent-active",
    ACTIVE: "text-highlight-fg",
    ENDED: "text-muted",
};

export type CourseFilter = "ALL" | CourseStatus;

// === Type ===

export type CourseStatus = "UPCOMING" | "ACTIVE" | "ENDED";

export type Course = {
    id: string;
    name: string;
    startDate: string;
    totalSessions: number;
    minStudents: number;
    maxStudents: number;
    status: CourseStatus;
    createdAt: string;
    enrolledCount: number;
    completedSessions: number;
};

export type CourseListParams = {
    page: number;
    size: number;
    filter: CourseFilter;
};

export type CreateCourseRequest = Pick<Course, "name" | "startDate" | "totalSessions" | "minStudents" | "maxStudents">;

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

export type CourseListResponse = {
    content: Course[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

// === Student Course Types ===

export type StudentCourse = Pick<Course, "id" | "name" | "startDate" | "totalSessions" | "status" | "completedSessions">;

export type StudentCourseListResponse = {
    content: StudentCourse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}