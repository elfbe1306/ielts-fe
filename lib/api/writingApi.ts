import { GenerateAiCorrectionsRequest, GenerateAiCorrectionsResponse, GenerateAiGradeRequest, GenerateAiGradeResponse } from "@/types/writing-correction-type";
import { http } from "./http";

export const writingApi = {
    generateAiCorrections: (data: GenerateAiCorrectionsRequest) => http.post<GenerateAiCorrectionsResponse>(`/api/writing/ai-corrections`, data),

    generateAiGrade: (data: GenerateAiGradeRequest) => http.post<GenerateAiGradeResponse>(`/api/writing/ai-grade`, data),
}