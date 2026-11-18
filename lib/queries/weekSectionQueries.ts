import { queryOptions } from "@tanstack/react-query";
import { courseKeys, enrolledCourseKeys } from "./courseQueries";
import { weekSectionApi } from "../api/weekSectionApi";

// ===== Teacher ======

export const weekSectionKeys = {
    list: (courseId: string) => [...courseKeys.detail(courseId), "week-sections"] as const,
}

export const weekSectionQueries = {
    list: (courseId: string) =>
        queryOptions({
            queryKey: weekSectionKeys.list(courseId),
            queryFn: () => weekSectionApi.getWeekSections(courseId),
        }),
}

// ===== Student ======

export const enrolledWeekSectionKeys = {
    list: (courseId: string) => [...enrolledCourseKeys.detail(courseId), "week-sections"] as const,
}

export const enrolledWeekSectionQueries = {
    list: (courseId: string) =>
        queryOptions({
            queryKey: enrolledWeekSectionKeys.list(courseId),
            queryFn: () => weekSectionApi.getEnrolledWeekSections(courseId),
        }),
}