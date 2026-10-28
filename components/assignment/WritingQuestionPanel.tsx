import { DIFFICULTY_COLORS, TASK_TYPE_COLORS, WritingQuestion } from "@/types/writing-question-type";
import { Image, Tag } from "antd";
import { useTranslations } from "next-intl";

type WritingQuestionPanelProps = {
    question: WritingQuestion;
    note?: string | null;
};

export default function WritingQuestionPanel({ question, note }: WritingQuestionPanelProps) {
    const t = useTranslations("writingWorkspace.writingQuestionPanel");

    const isTask1 = question.taskType === "TASK_1";
    const durationMinutes = isTask1 ? 20 : 40;
    const minWords = isTask1 ? 150 : 250;

    const trimmedNote = note?.trim();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
                <Tag variant="filled" color={TASK_TYPE_COLORS[question.taskType]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                    {t(`taskType.${question.taskType}`)}
                </Tag>
                <Tag variant="filled" color={DIFFICULTY_COLORS[question.difficulty]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                    {t(`difficulty.${question.difficulty}`)}
                </Tag>
            </div>

            <p className="text-lg font-semibold text-fg">{t("titleLabel")}</p>

            <p className="text-sm text-muted">
                {`You should spend about ${durationMinutes} minutes on this task. Write at least ${minWords} words.`}
            </p>

            <div className="whitespace-pre-line rounded-xl bg-surface p-4 leading-relaxed text-fg">
                {question.prompt}
            </div>

            <p className="text-sm text-muted">
                {isTask1
                    ? "Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
                    : "Give reasons for your answer and include any relevant examples from your own knowledge or experience."}
            </p>

            {isTask1 && question.imageUrl && (
                <div className="flex h-80 shrink-0">
                    <Image
                        src={question.imageUrl}
                        alt={""}
                        rootClassName="h-full w-full"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                </div>
            )}

            <p className="whitespace-pre-line wrap-break-word text-sm">
                <span className="text-fg">{t("noteLabel")}: </span>
                <span className="text-muted">{trimmedNote || t("noNote")}</span>
            </p>
        </div>
    );
}