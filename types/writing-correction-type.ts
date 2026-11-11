import { WritingGrade } from "./writing-attempt-type";
import { CorrectionType, Criterion } from "./writing-criterion-type";

// === Editor ===

export type CorrectionAttrs = {
    id: string;
    type: CorrectionType;
    criterion: Criterion;
    text: string;
    description: string;
};

export type CorrectionRange = {
    from: number;
    to: number;
    attrs: CorrectionAttrs;
};

// === AI Corrections ===

export type ResponseLanguage = "VI" | "EN";

export type GenerateCorrectionsRequest = {
    writingQuestionId: string;
    essay: string;
    language: ResponseLanguage;
};

export type AiCorrection = {
    context: string;
    quote: string;
    type: CorrectionType;
    criterion: Criterion;
    text: string;
    description: string;
};

export type GenerateCorrectionsResponse = {
    corrections: AiCorrection[];
};

// === AI Grade ===

export type GenerateGradeRequest = {
    writingQuestionId: string;
    essay: string;
    language: ResponseLanguage;
};

export type GenerateGradeResponse = {
    corrections: AiCorrection[];
    grade: WritingGrade;
};