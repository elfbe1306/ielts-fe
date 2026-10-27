// === Types ===

import { WritingQuestion } from "./writing-question-type";

export type CreateWritingAssignmentRequest = {
    weekSectionId: string;
    writingQuestionId: string;
    dueDate: string;
    dueTime: string;
    description?: string;
}

export type UpdateWritingAssignmentRequest = {
    dueDate?: string;
    dueTime?: string;
    description?: string | null;
};

export type WritingAssignment = {
    id: string;
    writingQuestion: WritingQuestion;
    dueDate: string;
    dueTime: string;
    description?: string;
    createdAt: string;
}