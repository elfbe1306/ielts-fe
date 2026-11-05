export type Criterion = "TR" | "CC" | "LR" | "GRA";

export const CRITERIA: Criterion[] = ["TR", "CC", "LR", "GRA"];

export type CriterionFilter = "ALL" | Criterion;

export type CorrectionType = "REPLACE" | "DELETE" | "INSERT" | "COMMENT";

export const CRITERION_STYLES: Record<Criterion, { active: string; hover: string; badge: string }> = {
    TR: {
        active: "bg-tr-bg text-tr inset-ring-2 inset-ring-tr",
        hover: "hover:bg-tr-bg/60 hover:text-tr",
        badge: "bg-tr text-white",
    },
    CC: {
        active: "bg-cc-bg text-cc inset-ring-2 inset-ring-cc",
        hover: "hover:bg-cc-bg/60 hover:text-cc",
        badge: "bg-cc text-white",
    },
    LR: {
        active: "bg-lr-bg text-lr inset-ring-2 inset-ring-lr",
        hover: "hover:bg-lr-bg/60 hover:text-lr",
        badge: "bg-lr text-white",
    },
    GRA: {
        active: "bg-gra-bg text-gra inset-ring-2 inset-ring-gra",
        hover: "hover:bg-gra-bg/60 hover:text-gra",
        badge: "bg-gra text-white",
    },
};