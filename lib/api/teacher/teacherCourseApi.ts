import { Course, CourseListResponse, CourseStatus, CreateCourseRequest, UpdateCourseRequest } from "@/types/course-type";
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

export const teacherCourseApi = {
    createCourse: (data: CreateCourseRequest) => http.post<Course>("/api/teacher/courses", data),

    listCourses: (params: ListCoursesParams) => http.get<CourseListResponse>(`/api/teacher/courses?${buildQuery(params)}`),

    getCourse: (courseId: string) => http.get<Course>(`/api/teacher/courses/${courseId}`),

    updateCourse: (courseId: string, data: UpdateCourseRequest) => http.patch<Course>(`/api/teacher/courses/${courseId}`, data),

    deleteCourse: (courseId: string) => http.delete<void>(`/api/teacher/courses/${courseId}`),

    listEnrollable: (params: Omit<ListCoursesParams, "status">) => teacherCourseApi.listCourses({ ...params, status: "NOT_ENDED" }),
}