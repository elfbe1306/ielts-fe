import { WritingQuestionListParams } from "@/types/writing-question-type";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { writingQuestionApi } from "../api/writingQuestionApi";

export const writingQuestionKeys = {
    all: ["writing-questions"] as const,
    lists: () => [...writingQuestionKeys.all, "list"] as const,
    list: (params: WritingQuestionListParams) => [...writingQuestionKeys.lists(), params] as const,
}

export const writingQuestionQueries = {
    list: (params: WritingQuestionListParams) =>
        queryOptions({
            queryKey: writingQuestionKeys.list(params),
            queryFn: () => writingQuestionApi.list(params),
            placeholderData: keepPreviousData,
        }),
}