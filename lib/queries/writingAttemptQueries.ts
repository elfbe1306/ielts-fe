import { queryOptions } from "@tanstack/react-query";
import { writingAttemptApi } from "../api/writingAttemptApi";
import { courseKeys, enrolledCourseKeys } from "./courseQueries";
import { enrolledWritingAssignmentKeys, writingAssignmentKeys } from "./writingAssignmentQueries";

// ===== Staff =====

export const writingAttemptKeys = {
    lists: (courseId: string, assignmentId: string) =>
        [...writingAssignmentKeys.detail(courseId, assignmentId), "attempts"] as const,
    list: (courseId: string, assignmentId: string, userId: string) =>
        [...writingAttemptKeys.lists(courseId, assignmentId), userId] as const,
    details: (courseId: string) => [...courseKeys.detail(courseId), "writing-attempts"] as const,
    detail: (courseId: string, attemptId: string) => [...writingAttemptKeys.details(courseId), attemptId] as const,
}

export const writingAttemptQueries = {
    list: (courseId: string, assignmentId: string, userId: string) =>
        queryOptions({
            queryKey: writingAttemptKeys.list(courseId, assignmentId, userId),
            queryFn: () => writingAttemptApi.listWritingAttempts(courseId, assignmentId, userId),
        }),

    detail: (courseId: string, attemptId: string) =>
        queryOptions({
            queryKey: writingAttemptKeys.detail(courseId, attemptId),
            queryFn: () => writingAttemptApi.getWritingAttempt(courseId, attemptId),
        }),
}

// ===== Student =====

export const enrolledWritingAttemptKeys = {
    list: (courseId: string, assignmentId: string) =>
        [...enrolledWritingAssignmentKeys.detail(courseId, assignmentId), "attempts"] as const,
    details: (courseId: string) => [...enrolledCourseKeys.detail(courseId), "writing-attempts"] as const,
    detail: (courseId: string, attemptId: string) => [...enrolledWritingAttemptKeys.details(courseId), attemptId] as const,
}

export const enrolledWritingAttemptQueries = {
    list: (courseId: string, assignmentId: string) =>
        queryOptions({
            queryKey: enrolledWritingAttemptKeys.list(courseId, assignmentId),
            queryFn: () => writingAttemptApi.listMyWritingAttempts(courseId, assignmentId),
        }),

    detail: (courseId: string, attemptId: string) =>
        queryOptions({
            queryKey: enrolledWritingAttemptKeys.detail(courseId, attemptId),
            queryFn: () => writingAttemptApi.getMyWritingAttempt(courseId, attemptId),
        }),
}