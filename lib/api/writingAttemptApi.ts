import { CreateWritingAttemptRequest, GradeWritingAttemptRequest, UpdateWritingAttemptRequest, WritingAttempt, WritingAttemptSummary } from "@/types/writing-attempt-type";
import { http } from "./http";

export const writingAttemptApi = {
    // ===== Member =====

    createWritingAttempt: (courseId: string, assignmentId: string, data: CreateWritingAttemptRequest) =>
        http.post<WritingAttempt>(`/api/courses/${courseId}/writing-assignments/${assignmentId}/attempts`, data),

    // ===== Staff =====

    listWritingAttempts: (courseId: string, assignmentId: string, userId: string) => {
        const params = new URLSearchParams({ userId });
        return http.get<WritingAttemptSummary[]>(`/api/courses/${courseId}/writing-assignments/${assignmentId}/attempts?${params}`);
    },

    getWritingAttempt: (courseId: string, attemptId: string) =>
        http.get<WritingAttempt>(`/api/courses/${courseId}/writing-attempts/${attemptId}`),

    updateWritingAttempt: (courseId: string, attemptId: string, data: UpdateWritingAttemptRequest) =>
        http.patch<WritingAttempt>(`/api/courses/${courseId}/writing-attempts/${attemptId}`, data),

    gradeWritingAttempt: (courseId: string, attemptId: string, data: GradeWritingAttemptRequest) =>
        http.post<WritingAttempt>(`/api/courses/${courseId}/writing-attempts/${attemptId}/grade`, data),

    // ===== Student =====

    listMyWritingAttempts: (courseId: string, assignmentId: string) =>
        http.get<WritingAttemptSummary[]>(`/api/courses/enrolled/${courseId}/writing-assignments/${assignmentId}/attempts`),

    getMyWritingAttempt: (courseId: string, attemptId: string) =>
        http.get<WritingAttempt>(`/api/courses/enrolled/${courseId}/writing-attempts/${attemptId}`),
}