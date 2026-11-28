import { formatDayMonth, formatTime, isOverdue } from "@/lib/utils";
import { Image, Listy, Tag, Tooltip, Typography } from "antd";
import { useTranslations } from "next-intl";
import Button from "../Button";
import { WritingAssignment } from "@/types/writing-assignment-type";
import { useRouter } from "@/i18n/navigation";
import { QUESTION_TYPE_LABELS, TASK_TYPE_COLORS, TASK_TYPE_LABELS } from "@/types/writing-question-type";
import FileEditIcon from "../icons/FileEditIcon";
import { ROUTES } from "@/lib/route";
import AlignLeftIcon from "../icons/AlignLeftIcon";

const THUMB_SIZE = 64;

type StudentAssignmentListProps = {
    courseId: string;
    writingAssignments: WritingAssignment[];
}

export default function StudentAssignmentList({ courseId, writingAssignments } : StudentAssignmentListProps) {
    const t = useTranslations("courseDetail.weekSectionCard.assignments");

    const router = useRouter();

    return (
        <Listy<WritingAssignment>
            items={writingAssignments}
            rowKey={"id"}
            classNames={{ root: "rounded-lg border border-border" }}
            itemRender={(assignment) => {
                const question = assignment.writingQuestion;
                const overdue = isOverdue(assignment.dueDate, assignment.dueTime);
                const hasNote = assignment.description?.trim() ? true : false;

                return (
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className="shrink-0"
                            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                        >
                            {question.imageUrl ? (
                                <Image
                                    src={question.imageUrl}
                                    alt={question.title}
                                    width={THUMB_SIZE}
                                    height={THUMB_SIZE}
                                    style={{ objectFit: "cover", borderRadius: 10, border: "1px solid var(--color-border)" }}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-[10px] border border-border bg-surface text-muted">
                                    <AlignLeftIcon width={22} height={22} />
                                </div>
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <p className="truncate text-sm font-medium text-fg">{question.title}</p>
                            <Tooltip
                                placement="topLeft"
                                title={<span className="whitespace-pre-line">{question.prompt}</span>}
                            >
                                <p className="truncate text-sm text-muted">{question.prompt}</p>
                            </Tooltip>

                            <div className="mt-1 flex items-center gap-1.5">
                                <Tag variant="filled" color={TASK_TYPE_COLORS[question.taskType]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                    {TASK_TYPE_LABELS[question.taskType]}
                                </Tag>
                                <Tag variant="filled" style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                    {QUESTION_TYPE_LABELS[question.questionType]}
                                </Tag>
                            </div>

                            {hasNote ? (
                                <Typography.Paragraph
                                    className="mt-1 text-sm text-muted"
                                    style={{ marginBottom: 0, whiteSpace: "pre-line", wordBreak: "break-word" }}
                                    ellipsis={{ 
                                        rows: 2, 
                                        expandable: "collapsible", 
                                        symbol: (expanded) => expanded ? t("showLess") : t("showMore")
                                    }}
                                >
                                    <span className="text-fg">{t("noteLabel")}: </span>
                                    {assignment.description}
                                </Typography.Paragraph>
                            ) : (
                                <p className="mt-1 text-sm">
                                    <span className="text-fg">{t("noteLabel")}: </span>
                                    {t("noNote")}
                                </p>
                            )}

                            <p className="text-sm">
                                <span className="font-medium text-muted">{t("dueLabel")}: </span>
                                <span className={overdue ? "text-error" : "text-fg"}>
                                    {formatTime(assignment.dueTime)} - {formatDayMonth(assignment.dueDate)}
                                </span>
                                {overdue && (
                                    <span className="ml-2 font-medium text-error">{t("overdue")}</span>
                                )}
                            </p>
                        </div>

                        <Button
                            label=""
                            type="button"
                            variant="secondary"
                            icon={<FileEditIcon width={18} height={18} />}
                            iconOnly={true}
                            onClick={() => router.push(ROUTES.writingAssignment(courseId, assignment.id))}
                        />
                    </div>
                )
            }}
        />
    );

}