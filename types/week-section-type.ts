
// === UI Type ===

import { WritingAssignment } from "./writing-assignment-type";

export type SessionErrors = {
    date?: string;
    startTime?: string;
    endTime?: string;
}

// === Type ===

export type ClassSession = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isNew?: boolean;
}

export type WeekSection = {
    id: string;
    weekName: string;
    createdAt: string;
    sessions: ClassSession[];
    writingAssignments: WritingAssignment[];
}

export type CreateWeekSectionRequest = {
    courseId: string;
    weekName: string;
    sessions: Omit<ClassSession, "id" | "isNew">[];
}

export type UpdateSessionRequest = {
    id: string | null;
    date: string;
    startTime: string;
    endTime: string;
}

export type UpdateWeekSectionRequest = Partial<{
    weekName: string;
    sessions: UpdateSessionRequest[];
}>;