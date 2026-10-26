import { CreateWritingQuestionRequest, UpdateWritingQuestionRequest, WritingQuestionListResponse, WritingTaskType } from "@/types/writing-question-type";
import { http } from "./http";

type ListWritingQuestionParams = {
    page: number,
    size: number,
    taskType?: WritingTaskType,
}

function buildQuery(params: ListWritingQuestionParams): string {
    const searchParams = new URLSearchParams({
        page: String(params.page),
        size: String(params.size),
    });

    if (params.taskType) searchParams.append("taskType", params.taskType);

    return searchParams.toString();
}

export const WritingQuestionApi = {
    create: (payload: CreateWritingQuestionRequest) => {
        const formData = new FormData();

        formData.append("title", payload.title);
        formData.append("prompt", payload.prompt);
        formData.append("taskType", payload.taskType);
        formData.append("difficulty", payload.difficulty);

        if (payload.image) formData.append("image", payload.image);

        return http.post("/api/writing-questions", formData);
    },

    list: (params: ListWritingQuestionParams) => http.get<WritingQuestionListResponse>(`/api/writing-questions?${buildQuery(params)}`),

    update: (id: string, payload: UpdateWritingQuestionRequest) => {
        const formData = new FormData();
        if (payload.title !== undefined) formData.append("title", payload.title);
        if (payload.prompt !== undefined) formData.append("prompt", payload.prompt);
        if (payload.taskType !== undefined) formData.append("taskType", payload.taskType);
        if (payload.difficulty !== undefined) formData.append("difficulty", payload.difficulty);
        if (payload.image) formData.append("image", payload.image);
        if (payload.removeImage) formData.append("removeImage", "true");

        return http.patch(`/api/writing-questions/${id}`, formData)
    },

    delete: (id: string) => http.delete<void>(`/api/writing-questions/${id}`)
}