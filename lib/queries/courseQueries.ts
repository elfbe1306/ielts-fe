import { CourseListParams } from "@/types/course-type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { courseApi } from "../api/courseApi";

// ===== Teacher =====

export const courseKeys = {
    all: ["courses"] as const,
    lists: () => [...courseKeys.all, "list"] as const,
    list: (params: CourseListParams) => [...courseKeys.lists(), params] as const,
    details: () => [...courseKeys.all, "detail"] as const,
    detail: (courseId: string) => [...courseKeys.details(), courseId] as const,
}

export const courseQueries = {
    list: (params: CourseListParams) => 
        queryOptions({
            queryKey: courseKeys.list(params),
            queryFn: () => courseApi.listCourses(params),
            placeholderData: keepPreviousData
        }),

    detail: (courseId: string) =>
        queryOptions({
            queryKey: courseKeys.detail(courseId),
            queryFn: () => courseApi.getCourse(courseId),
        })
}

// ===== Student =====

export const enrolledCourseKeys = {
    all: ["enrolled-courses"] as const,
    lists: () => [...enrolledCourseKeys.all, "list"] as const,
    list: (params: CourseListParams) => [...enrolledCourseKeys.lists(), params] as const,
    details: () => [...enrolledCourseKeys.all, "detail"] as const,
    detail: (courseId: string) => [...enrolledCourseKeys.details(), courseId] as const,
}

export const enrolledCourseQueries = {
    list: (params: CourseListParams) =>
        queryOptions({
            queryKey: enrolledCourseKeys.list(params),
            queryFn: () => courseApi.getEnrolledCourses(params),
            placeholderData: keepPreviousData
        }),
        
    detail: (courseId: string) =>
        queryOptions({
            queryKey: enrolledCourseKeys.detail(courseId),
            queryFn: () => courseApi.getEnrolledCourseById(courseId),
        })
}