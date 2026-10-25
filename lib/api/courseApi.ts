import { Course, CourseListResponse, CourseStatus, CreateCourseRequest, UpdateCourseRequest } from "@/types/course-type";
import { http } from "./http";

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

export const courseApi = {
    createCourse: (data: CreateCourseRequest) => http.post<Course>("/api/courses", data),

    listCourses: (params: ListCoursesParams) => http.get<CourseListResponse>(`/api/courses?${buildQuery(params)}`),

    getCourse: (courseId: string) => http.get<Course>(`/api/courses/${courseId}`),

    updateCourse: (courseId: string, data: UpdateCourseRequest) => http.patch<Course>(`/api/courses/${courseId}`, data),

    deleteCourse: (courseId: string) => http.delete<void>(`/api/courses/${courseId}`),

    listEnrollable: (params: Omit<ListCoursesParams, "status">) => courseApi.listCourses({ ...params, status: "NOT_ENDED" }),
}