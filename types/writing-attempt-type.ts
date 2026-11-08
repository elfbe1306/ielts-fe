export type CreateWritingAttemptRequest = {
    assignmentId: string;
    content: string;
};

export type WritingAttemptStatus = "SUBMITTED" | "GRADED";

export type WritingAttempt = {
    id: string;
    originalContent: string;
    gradedContent: string | null;
    status: WritingAttemptStatus;
    submittedAt: string;
};