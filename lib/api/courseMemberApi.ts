import { AddCourseMemberRequest, CourseMember, UpdateCourseMemberRequest } from "@/types/course-member-type";
import { http } from "./http";

export const courseMemberApi = {
    // ===== Teacher =====
 
    getMembers: (courseId: string) => http.get<CourseMember[]>(`/api/courses/${courseId}/members`),

    addMember: (courseId: string, data: AddCourseMemberRequest) => http.post<CourseMember>(`/api/courses/${courseId}/members`, data),

    updateMember: (courseId: string, userId: string, data: UpdateCourseMemberRequest) => http.patch<CourseMember>(`/api/courses/${courseId}/members/${userId}`, data),

    deleteMember: (courseId: string, userId: string) => http.delete<void>(`/api/courses/${courseId}/members/${userId}`),

    // ===== Any member =====

    getMyMembership: (courseId: string) => http.get<CourseMember>(`/api/courses/${courseId}/members/me`),

    // ===== Student =====
 
    getEnrolledMembers: (courseId: string) => http.get<CourseMember[]>(`/api/courses/enrolled/${courseId}/members`),
}