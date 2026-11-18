import { CreateWeekSectionRequest, UpdateWeekSectionRequest, WeekSection } from "@/types/week-section-type";
import { http } from "./http";

export const weekSectionApi = {
    // ===== Teacher =====

    createWeekSection: (courseId: string, data: CreateWeekSectionRequest) => http.post<WeekSection>(`/api/courses/${courseId}/week-sections`, data),
    
    getWeekSections: (courseId: string) => http.get<WeekSection[]>(`/api/courses/${courseId}/week-sections`),

    updateWeekSection: (courseId: string, weekSectionId: string, data: UpdateWeekSectionRequest) => http.patch<WeekSection>(`/api/courses/${courseId}/week-sections/${weekSectionId}`, data),

    deleteWeekSection: (courseId: string, weekSectionId: string) => http.delete<void>(`/api/courses/${courseId}/week-sections/${weekSectionId}`),

    // ===== Student =====

    getEnrolledWeekSections: (courseId: string) => http.get<WeekSection[]>(`/api/courses/enrolled/${courseId}/week-sections`),
    
}