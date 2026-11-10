import { CRITERION_STYLES, CriterionKey, SCORE_CRITERIA } from "@/types/writing-criterion-type";
import { useTranslations } from "next-intl";
import { useState } from "react";
import TextInput from "../form-input/TextInput";
import { WritingGrade } from "@/types/writing-attempt-type";

type CriterionDraft = {
    score: number | "";
    feedback: string;
};

type GradeDraft = {
    taskResponse: CriterionDraft;
    coherenceCohesion: CriterionDraft;
    lexicalResource: CriterionDraft;
    grammaticalRange: CriterionDraft;
    generalFeedback: string;
};

function toDraft(grade: WritingGrade | null): GradeDraft {
    const criterion = (key: CriterionKey): CriterionDraft => ({
        score: grade?.[key].score ?? "",
        feedback: grade?.[key].feedback ?? "",
    });

    return {
        taskResponse: criterion("taskResponse"),
        coherenceCohesion: criterion("coherenceCohesion"),
        lexicalResource: criterion("lexicalResource"),
        grammaticalRange: criterion("grammaticalRange"),
        generalFeedback: grade?.generalFeedback ?? "",
    };
}

type GradingPanelProps = {
    initialGrade: WritingGrade | null;
    readonly?: boolean;
};

export default function GradingPanel({ initialGrade, readonly = false } : GradingPanelProps) {
    const t = useTranslations("writingWorkspace.gradingPanel");

    const [draft, setDraft] = useState<GradeDraft>(() => toDraft(initialGrade));

    const handleCriterionChange = (key: CriterionKey, patch: Partial<CriterionDraft>) => {
        setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {SCORE_CRITERIA.map(({ key, label }) => {
                    const { score, feedback } = draft[key];

                    return (
                        <div key={key} className="flex flex-col gap-2 rounded-xl border border-border p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${CRITERION_STYLES[label].active}`}>
                                        {label}
                                    </span>
                                    <span className="truncate text-sm text-muted">{t(`criteria.${key}`)}</span>
                                </div>

                                {readonly ? (
                                    <span className="text-lg font-bold tabular-nums text-accent">
                                        {score === "" ? "–" : score.toFixed(1)}
                                    </span>
                                ) : (
                                    <div className="w-20 shrink-0">
                                        <TextInput
                                            type="number"
                                            size="sm"
                                            placeholder="–"
                                            min={0}
                                            max={9}
                                            step={0.5}
                                            value={score}
                                            onChange={(value) => handleCriterionChange(key, { score: value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {readonly ? (
                                <p className="whitespace-pre-line text-sm text-fg">
                                    {feedback.trim() ? feedback : <span className="text-muted">{t("noFeedback")}</span>}
                                </p>
                            ) : (
                                <TextInput
                                    type="textarea"
                                    size="sm"
                                    rows={2}
                                    placeholder={t("feedbackPlaceholder")}
                                    value={feedback}
                                    onChange={(value) => handleCriterionChange(key, { feedback: value })}
                                />
                            )}
                        </div>
                    );
                })}

                <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
                    <p className="text-sm font-semibold text-fg">{t("generalFeedback")}</p>

                    {readonly ? (
                        <p className="whitespace-pre-line text-sm text-fg">
                            {draft.generalFeedback.trim()
                                ? draft.generalFeedback
                                : <span className="text-muted">{t("noFeedback")}</span>}
                        </p>
                    ) : (
                        <TextInput
                            type="textarea"
                            size="sm"
                            rows={4}
                            placeholder={t("generalFeedbackPlaceholder")}
                            value={draft.generalFeedback}
                            onChange={(value) => setDraft((prev) => ({ ...prev, generalFeedback: value }))}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}