import { CreateWritingAssignmentRequest, UpdateWritingAssignmentRequest, WritingAssignment } from "@/types/writing-assignment-type";
import { http } from "../http";

export const teacherWritingAssignmentApi = {
    createWritingAssignment: (data: CreateWritingAssignmentRequest) => http.post<WritingAssignment>(`/api/teacher/writing-assignments`, data),

    updateWritingAssignment: (assignmentId: string, data: UpdateWritingAssignmentRequest) => http.patch<WritingAssignment>(`/api/teacher/writing-assignments/${assignmentId}`, data),

    deleteWritingAssignment: (assignmentId: string) => http.delete<void>(`/api/teacher/writing-assignments/${assignmentId}`),
}