import { WeekSection } from "./week-section-type";

// === UI Type ===

export const STATUS_STYLE: Record<CourseStatus, string> = {
    UPCOMING: "bg-accent-bg text-accent-active",
	ACTIVE: "bg-highlight-bg text-highlight-fg border border-highlight",
    ENDED: "bg-surface text-muted border border-border",
};

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
	weekSections: WeekSection[];
};

export type CreateCourseRequest = Omit<Course, "id" | "status" | "createdAt" | "enrolledCount" | "completedSessions" | "weekSections">;

export type UpdateCourseRequest = Partial<Omit<Course, "id" | "status" | "createdAt" | "enrolledCount" | "completedSessions" | "weekSections">>;

export type CourseListResponse = {
	content: Course[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
};

// === Student Course Types ===

export type StudentCourse = Omit<Course, "minStudents" | "maxStudents" | "createdAt" | "enrolledCount">;

export type StudentCourseListResponse = {
	content: StudentCourse[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
}