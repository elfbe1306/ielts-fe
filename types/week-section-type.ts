
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

export type SessionTime = Pick<ClassSession, "date" | "startTime" | "endTime">;

export type CreateWeekSectionRequest = {
    weekName: string;
    sessions: SessionTime[];
}

export type UpdateSessionRequest = SessionTime & {
    id: string | null;
}

export type UpdateWeekSectionRequest = Partial<{
    weekName: string;
    sessions: UpdateSessionRequest[];
}>;