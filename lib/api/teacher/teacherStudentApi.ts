import { CreateStudentRequest, StudentListResponse, UpdateStudentRequest } from "@/types/user-type";
import { http } from "../http";

type ListStudentsParams = {
    page: number,
    size: number,
    search?: string
}

function buildQuery(params: ListStudentsParams): string {
    const searchParams = new URLSearchParams({
        page: String(params.page),
        size: String(params.size),
    });

    if (params.search) {
        searchParams.set("search", params.search);
    }

    return searchParams.toString();
}

export const teacherStudentApi = {
    createStudentAccount: (data: CreateStudentRequest) => http.post<void>("/api/teacher/students", data),

    getAllStudentAccounts: (params: ListStudentsParams) => http.get<StudentListResponse>(`/api/teacher/students?${buildQuery(params)}`),

    updateStudentAccount: (userId: string, data: UpdateStudentRequest) => http.patch<void>(`/api/teacher/students/${userId}`, data),

    deleteStudentAccount: (userId: string) => http.delete<void>(`/api/teacher/students/${userId}`)
}