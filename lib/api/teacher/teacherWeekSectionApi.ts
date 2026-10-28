import { CreateWeekSectionRequest, UpdateWeekSectionRequest, WeekSection } from "@/types/week-section-type";
import { http } from "../http";

export const teacherWeekSectionApi = {
    createWeekSection: (data: CreateWeekSectionRequest) => http.post<WeekSection>(`/api/teacher/week-sections`, data),

    updateWeekSection: (weekSectionId: string, data: UpdateWeekSectionRequest) => http.patch<WeekSection>(`/api/teacher/week-sections/${weekSectionId}`, data),

    deleteWeekSection: (weekSectionId: string) => http.delete<void>(`/api/teacher/week-sections/${weekSectionId}`),
}