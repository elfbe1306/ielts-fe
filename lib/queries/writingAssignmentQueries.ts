import { queryOptions } from "@tanstack/react-query";
import { courseKeys, enrolledCourseKeys } from "./courseQueries";
import { writingAssignmentApi } from "../api/writingAssignmentApi";

// ===== Teacher =====

export const writingAssignmentKeys = {
    detail: (courseId: string, assignmentId: string) =>
        [...courseKeys.detail(courseId), "writing-assignments", assignmentId] as const,
}

export const writingAssignmentQueries = {
    detail: (courseId: string, assignmentId: string) =>
        queryOptions({
            queryKey: writingAssignmentKeys.detail(courseId, assignmentId),
            queryFn: () => writingAssignmentApi.getWritingAssignment(courseId, assignmentId),
        }),
}

// ===== Student =====

export const enrolledWritingAssignmentKeys = {
    detail: (courseId: string, assignmentId: string) =>
        [...enrolledCourseKeys.detail(courseId), "writing-assignments", assignmentId] as const,
}

export const enrolledWritingAssignmentQueries = {
    detail: (courseId: string, assignmentId: string) =>
        queryOptions({
            queryKey: enrolledWritingAssignmentKeys.detail(courseId, assignmentId),
            queryFn: () => writingAssignmentApi.getEnrolledWritingAssignment(courseId, assignmentId),
        }),
}