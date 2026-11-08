import { CreateWritingAttemptRequest, WritingAttempt } from "@/types/writing-attempt-type";
import { http } from "./http";

export const writingAttemptApi = {
    createWritingAttempt: (data: CreateWritingAttemptRequest) => http.post<WritingAttempt>("/api/writing-attempts", data),
}