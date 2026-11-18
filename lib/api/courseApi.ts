import { Course, CourseListParams, CourseListResponse, CreateCourseRequest, StudentCourse, StudentCourseListResponse, UpdateCourseRequest } from "@/types/course-type";
import { http } from "./http";

function buildQuery(params: CourseListParams): string {
    const searchParams = new URLSearchParams({
        page: String(params.page),
        size: String(params.size),
    });

    if (params.filter !== "ALL") {
        searchParams.set("status", params.filter);
    }

    return searchParams.toString();
}

export const courseApi = {
    // ===== Teacher =====

    createCourse: (data: CreateCourseRequest) => http.post<Course>("/api/courses", data),

    listCourses: (params: CourseListParams) => http.get<CourseListResponse>(`/api/courses?${buildQuery(params)}`),

    getCourse: (courseId: string) => http.get<Course>(`/api/courses/${courseId}`),

    updateCourse: (courseId: string, data: UpdateCourseRequest) => http.patch<Course>(`/api/courses/${courseId}`, data),

    deleteCourse: (courseId: string) => http.delete<void>(`/api/courses/${courseId}`),
    
    // ===== Student =====

    getEnrolledCourses: (params: CourseListParams) => http.get<StudentCourseListResponse>(`/api/courses/enrolled?${buildQuery(params)}`),

    getEnrolledCourseById: (courseId: string) => http.get<StudentCourse>(`/api/courses/enrolled/${courseId}`),
}