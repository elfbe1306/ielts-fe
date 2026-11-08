export type CreateWritingAttemptRequest = {
    assignmentId: string;
    content: string;
};

export type WritingAttemptStatus = "SUBMITTED" | "GRADED";

export type WritingScore = {
    taskResponse: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
    overall: number;
};

export type WritingAttempt = {
    id: string;
    originalContent: string;
    gradedContent: string | null;
    status: WritingAttemptStatus;
    submittedAt: string;
    score: WritingScore | null;
};

export type WritingAttemptSummary = Omit<WritingAttempt, "originalContent" | "gradedContent">;