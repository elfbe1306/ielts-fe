import { formatInstant } from "@/lib/utils";
import { WritingAttemptSummary } from "@/types/writing-attempt-type";
import { SCORE_CRITERIA } from "@/types/writing-criterion-type";
import { useTranslations } from "next-intl";

type AttemptOptionProps = {
    attempt: WritingAttemptSummary;
    index: number;
};
 
export default function AttemptOption({ attempt, index }: AttemptOptionProps) {
    const t = useTranslations("writingWorkspace.attempts");
    const grade = attempt.grade;
 
    return (
        <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold text-fg">{t("label", { index })}</span>
 
                <span className="text-xs text-muted">
                    {formatInstant(attempt.submittedAt)}
                    {" · "}
                    <span className={attempt.status === "GRADED" ? "text-success" : "text-highlight"}>
                        {t(`status.${attempt.status}`)}
                    </span>
                </span>
 
                {grade && (
                    <span className="text-xs text-muted">
                        {SCORE_CRITERIA.map(({ key, label }) => `${label} ${grade[key].score}`).join(" · ")}
                    </span>
                )}
            </div>

            {grade && <span className="text-lg font-bold text-accent">{grade.overall}</span>}
        </div>
    );
}