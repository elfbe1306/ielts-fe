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

export type CriterionScore = {
    criterion: Criterion;
    band: number;
    feedback: string;
};

export type AiScore = {
    overallBand: number;
    criteria: CriterionScore[];
    summary: string;
};

export type GenerateGradeResponse = GenerateCorrectionsResponse & {
    score: AiScore;
};
