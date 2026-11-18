import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { studentApi } from "../api/studentApi";
import { StudentListParams } from "@/types/student-type";

export const studentKeys = {
    all: ["students"] as const,
    lists: () => [...studentKeys.all, "list"] as const,
    list: (params: StudentListParams) => [...studentKeys.lists(), params] as const,
}

export const studentQueries = {
    list: (params: StudentListParams) =>
        queryOptions({
            queryKey: studentKeys.list(params),
            queryFn: () => studentApi.getAllStudentAccounts(params),
            placeholderData: keepPreviousData,
        }),
}