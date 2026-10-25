import { CreateWeekSectionRequest, UpdateWeekSectionRequest, WeekSection } from "@/types/week-section-type";
import { http } from "./http";

export const weekSectionApi = {
    createWeekSection: (data: CreateWeekSectionRequest) => http.post<WeekSection>(`/api/week-sections`, data),

    updateWeekSection: (weekSectionId: string, data: UpdateWeekSectionRequest) => http.patch<WeekSection>(`/api/week-sections/${weekSectionId}`, data),

    deleteWeekSection: (weekSectionId: string) => http.delete<void>(`/api/week-sections/${weekSectionId}`),
}