import { CreateWritingAssignmentRequest, UpdateWritingAssignmentRequest, WritingAssignment } from "@/types/writing-assignment-type";
import { http } from "./http";

export const writingAssignmentApi = {
    createWritingAssignment: (data: CreateWritingAssignmentRequest) => http.post<WritingAssignment>(`/api/writing-assignments`, data),

    getWritingAssignment: (assignmentId: string) => http.get<WritingAssignment>(`/api/writing-assignments/${assignmentId}`),

    updateWritingAssignment: (assignmentId: string, data: UpdateWritingAssignmentRequest) => http.patch<WritingAssignment>(`/api/writing-assignments/${assignmentId}`, data),

    deleteWritingAssignment: (assignmentId: string) => http.delete<void>(`/api/writing-assignments/${assignmentId}`),
}