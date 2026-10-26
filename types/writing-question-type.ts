// === UI Type ===

export const TASK_TYPE_COLORS: Record<WritingTaskType, string> = {
    TASK_1: "blue",
    TASK_2: "purple",
};

export const DIFFICULTY_COLORS: Record<WritingDifficulty, string> = {
    EASY: "green",
    MEDIUM: "gold",
    HARD: "red",
};

// === Type ===

export const TASK_TYPES = ["TASK_1", "TASK_2"] as const;
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export type WritingTaskType = (typeof TASK_TYPES)[number];
export type WritingDifficulty = (typeof DIFFICULTIES)[number];

export type WritingQuestion = {
    id: string;
    title: string;
    prompt: string;
    taskType: WritingTaskType;
    difficulty: WritingDifficulty;
    imageUrl: string | null;
    createdAt: string;
};

export type CreateWritingQuestionRequest = Omit<WritingQuestion, "id" | "imageUrl" | "createdAt"> & {
    image?: File;
};

export type UpdateWritingQuestionRequest = Partial<CreateWritingQuestionRequest> & {
    removeImage?: boolean;
};

export type WritingQuestionListResponse = {
    content: WritingQuestion[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};