import { CreateWritingAttemptRequest, WritingAttempt, WritingAttemptSummary } from "@/types/writing-attempt-type";
import { http } from "./http";

export const writingAttemptApi = {
    createWritingAttempt: (data: CreateWritingAttemptRequest) => http.post<WritingAttempt>("/api/writing-attempts", data),

    listWritingAttempts: (assignmentId: string, userId: string) => {
        const params = new URLSearchParams({ assignmentId, userId });
        return http.get<WritingAttemptSummary[]>(`/api/writing-attempts?${params}`);
    },

    getWritingAttempt: (attemptId: string) => http.get<WritingAttempt>(`/api/writing-attempts/${attemptId}`),
}