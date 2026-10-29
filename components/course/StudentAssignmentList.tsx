import { formatDayMonth, formatTime, isOverdue } from "@/lib/utils";
import { Image, Listy, Tag, Tooltip, Typography } from "antd";
import { useTranslations } from "next-intl";
import Button from "../Button";
import { WritingAssignment } from "@/types/writing-assignment-type";
import { useRouter } from "@/i18n/navigation";
import { DIFFICULTY_COLORS, TASK_TYPE_COLORS } from "@/types/writing-question-type";
import FileEditIcon from "../icons/FileEditIcon";
import { ROUTES } from "@/lib/route";

const THUMB_SIZE = 64;

type StudentAssignmentListProps = {
    courseId: string;
    writingAssignments: WritingAssignment[];
}

export default function StudentAssignmentList({ courseId, writingAssignments } : StudentAssignmentListProps) {
    const t = useTranslations("studentCourseDetailPage.weekSectionCard.assignments");

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
                            className="shrink-0 overflow-hidden rounded-md bg-gray-100"
                            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                        >
                            {question.imageUrl ? (
                                <Image
                                    src={question.imageUrl}
                                    alt={question.title}
                                    width={THUMB_SIZE}
                                    height={THUMB_SIZE}
                                    style={{ objectFit: "cover" }}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                                    —
                                </div>
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <Tooltip
                                placement="topLeft"
                                title={<span className="whitespace-pre-line">{question.prompt}</span>}
                            >
                                <div className="flex min-w-0 flex-col gap-1">
                                    <p className="truncate text-sm font-medium text-fg">{question.title}</p>
                                    <p className="truncate text-sm text-muted">{question.prompt}</p>
                                </div>
                            </Tooltip>

                            <div className="mt-1 flex items-center gap-1.5">
                                <Tag variant="filled" color={TASK_TYPE_COLORS[question.taskType]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                    {t(`taskType.${question.taskType}`)}
                                </Tag>
                                <Tag variant="filled" color={DIFFICULTY_COLORS[question.difficulty]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                    {t(`difficulty.${question.difficulty}`)}
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
                            onClick={() => router.push(ROUTES.student.writingAssignment(courseId, assignment.id))}
                        />
                    </div>
                )
            }}
        />
    );

}