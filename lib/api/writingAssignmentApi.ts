import { CreateWritingAssignmentRequest, UpdateWritingAssignmentRequest, WritingAssignment } from "@/types/writing-assignment-type";
import { http } from "./http";

export const writingAssignmentApi = {
    // ===== Teacher =====

    createWritingAssignment: (courseId: string, weekSectionId: string, data: CreateWritingAssignmentRequest) =>
        http.post<WritingAssignment>(`/api/courses/${courseId}/week-sections/${weekSectionId}/writing-assignments`, data),

    getWritingAssignment: (courseId: string, assignmentId: string) =>
        http.get<WritingAssignment>(`/api/courses/${courseId}/writing-assignments/${assignmentId}`),

    updateWritingAssignment: (courseId: string, assignmentId: string, data: UpdateWritingAssignmentRequest) =>
        http.patch<WritingAssignment>(`/api/courses/${courseId}/writing-assignments/${assignmentId}`, data),

    deleteWritingAssignment: (courseId: string, assignmentId: string) =>
        http.delete<void>(`/api/courses/${courseId}/writing-assignments/${assignmentId}`),

    // ===== Student =====

    getEnrolledWritingAssignment: (courseId: string, assignmentId: string) =>
        http.get<WritingAssignment>(`/api/courses/enrolled/${courseId}/writing-assignments/${assignmentId}`),
}