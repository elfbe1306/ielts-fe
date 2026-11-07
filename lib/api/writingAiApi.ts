import { GenerateCorrectionsRequest, GenerateCorrectionsResponse, GenerateGradeRequest, GenerateGradeResponse } from "@/types/writing-correction-type";
import { http } from "./http";

export const writingAiApi = {
    generateCorrections: (data: GenerateCorrectionsRequest) => http.post<GenerateCorrectionsResponse>(`/api/writing-ai/corrections`, data),

    generateGrade: (data: GenerateGradeRequest) => http.post<GenerateGradeResponse>(`/api/writing-ai/grade`, data),
}