// === UI Type ===

export const TASK_TYPE_COLORS: Record<WritingTaskType, string> = {
    TASK_1: "blue",
    TASK_2: "purple",
};

export const TASK_TYPE_LABELS: Record<WritingTaskType, string> = {
    TASK_1: "Task 1",
    TASK_2: "Task 2",
};

export const QUESTION_TYPE_LABELS: Record<WritingQuestionType, string> = {
    LINE_GRAPH: "Line graph",
    BAR_CHART: "Bar chart",
    PIE_CHART: "Pie chart",
    TABLE: "Table",
    MIXED: "Mixed charts",
    PROCESS: "Process",
    MAP: "Map",
    OPINION: "Agree / Disagree",
    DISCUSSION: "Discuss both views",
    ADVANTAGES_DISADVANTAGES: "Advantages & disadvantages",
    PROBLEM_SOLUTION: "Problem & solution",
    TWO_PART: "Two-part question",
};

// === Type ===

export const TASK_TYPES = ["TASK_1", "TASK_2"] as const;

export const TASK_1_QUESTION_TYPES = [
    "LINE_GRAPH",
    "BAR_CHART",
    "PIE_CHART",
    "TABLE",
    "MIXED",
    "PROCESS",
    "MAP",
] as const;

export const TASK_2_QUESTION_TYPES = [
    "OPINION",
    "DISCUSSION",
    "ADVANTAGES_DISADVANTAGES",
    "PROBLEM_SOLUTION",
    "TWO_PART",
] as const;

export type WritingTaskType = (typeof TASK_TYPES)[number];
export type WritingQuestionType = (typeof TASK_1_QUESTION_TYPES)[number] | (typeof TASK_2_QUESTION_TYPES)[number];

export const QUESTION_TYPES_BY_TASK: Record<WritingTaskType, readonly WritingQuestionType[]> = {
    TASK_1: TASK_1_QUESTION_TYPES,
    TASK_2: TASK_2_QUESTION_TYPES,
};

export type WritingQuestionFilter = "ALL" | WritingTaskType;

export type WritingQuestion = {
    id: string;
    title: string;
    prompt: string;
    taskType: WritingTaskType;
    questionType: WritingQuestionType;
    imageUrl: string | null;
    createdAt: string;
};

export type WritingQuestionListParams = {
    page: number;
    size: number;
    filter: WritingQuestionFilter;
};

export type CreateWritingQuestionRequest = Pick<WritingQuestion, "title" | "prompt" | "taskType" | "questionType"> & {
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