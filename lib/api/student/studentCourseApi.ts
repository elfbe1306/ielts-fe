import { CourseMember, CourseStatus, StudentCourse, StudentCourseListResponse } from "@/types/course-type";
import { http } from "../http";

type CourseStatusFilter = CourseStatus | "NOT_ENDED";

type ListCoursesParams = {
    page: number,
    size: number,
    status?: CourseStatusFilter
}

function buildQuery(params: ListCoursesParams): string {
    const searchParams = new URLSearchParams({
        page: String(params.page),
        size: String(params.size),
    });

    if (params.status) {
        searchParams.set("status", params.status);
    }

    return searchParams.toString();
}

export const studentCourseApi = {
    getEnrolledCourses: (params: ListCoursesParams) => http.get<StudentCourseListResponse>(`/api/student/courses?${buildQuery(params)}`),

    getEnrolledCourseById: (courseId: string) => http.get<StudentCourse>(`/api/student/courses/${courseId}`),

    listMembers: (courseId: string) => http.get<CourseMember[]>(`/api/student/courses/${courseId}/members`)
}