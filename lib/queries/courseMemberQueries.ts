import { queryOptions } from "@tanstack/react-query";
import { courseKeys, enrolledCourseKeys } from "./courseQueries";
import { courseMemberApi } from "../api/courseMemberApi";
 
// ===== Teacher =====
 
export const courseMemberKeys = {
    list: (courseId: string) => [...courseKeys.detail(courseId), "members"] as const,
}
 
export const courseMemberQueries = {
    list: (courseId: string) =>
        queryOptions({
            queryKey: courseMemberKeys.list(courseId),
            queryFn: () => courseMemberApi.getMembers(courseId),
        }),
}
 
// ===== Student =====
 
export const enrolledCourseMemberKeys = {
    list: (courseId: string) => [...enrolledCourseKeys.detail(courseId), "members"] as const,
}
 
export const enrolledCourseMemberQueries = {
    list: (courseId: string) =>
        queryOptions({
            queryKey: enrolledCourseMemberKeys.list(courseId),
            queryFn: () => courseMemberApi.getEnrolledMembers(courseId),
        }),
}