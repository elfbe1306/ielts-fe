export type CreateWritingAttemptRequest = {
    assignmentId: string;
    content: string;
};

export type WritingAttemptStatus = "SUBMITTED" | "GRADED";

export type CriterionGrade = {
    score: number;
    feedback: string;
};

export type WritingGrade = {
    taskResponse: CriterionGrade;
    coherenceCohesion: CriterionGrade;
    lexicalResource: CriterionGrade;
    grammaticalRange: CriterionGrade;
    overall: number;
    generalFeedback: string;
};

export type WritingAttempt = {
    id: string;
    originalContent: string;
    gradedContent: string | null;
    status: WritingAttemptStatus;
    submittedAt: string;
    grade: WritingGrade | null;
};

export type WritingAttemptSummary = Omit<WritingAttempt, "originalContent" | "gradedContent">;

