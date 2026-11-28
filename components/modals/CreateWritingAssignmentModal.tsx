import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Checkbox, Image, Table, TableColumnsType, Tag, Tooltip } from "antd";
import Button from "../Button";
import { useAppMessage } from "@/contexts/message-context";
import { QUESTION_TYPE_LABELS, QUESTION_TYPES_BY_TASK, TASK_TYPE_COLORS, TASK_TYPE_LABELS, TASK_TYPES, WritingQuestion, WritingQuestionType, WritingTaskType } from "@/types/writing-question-type";
import { writingQuestionQueries } from "@/lib/queries/writingQuestionQueries";
import { weekSectionKeys } from "@/lib/queries/weekSectionQueries";
import DateInput from "../form-input/DateInput";
import TimeInput from "../form-input/TimeInput";
import TextInput from "../form-input/TextInput";
import { CreateWritingAssignmentRequest } from "@/types/writing-assignment-type";
import { writingAssignmentApi } from "@/lib/api/writingAssignmentApi";
import AlignLeftIcon from "../icons/AlignLeftIcon";

const DEFAULT_PAGE_SIZE = 5;
const THUMB_SIZE = 64;
const ALL_QUESTION_TYPES: WritingQuestionType[] = TASK_TYPES.flatMap((task) => [...QUESTION_TYPES_BY_TASK[task]]);

type CreateWritingAssignmentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    weekSectionId: string;
}

type Errors = {
    selectedQuestionError?: string;
    dueDateError?: string;
    dueTimeError?: string;
}

export default function CreateWritingAssignmentModal({ isOpen, onClose, courseId, weekSectionId } : CreateWritingAssignmentModalProps) {
    const t = useTranslations("courseDetail.createWritingAssignmentModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [selectedQuestion, setSelectedQuestion] = useState<WritingQuestion | null>(null);
    const [dueDate, setDueDate] = useState<string>("");
    const [dueTime, setDueTime] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [errors, setErrors] = useState<Errors>({});

    const [selectedTypes, setSelectedTypes] = useState<WritingQuestionType[]>([]);
    const [page, setPage] = useState<number>(0);

    const { data, isLoading, isError } = useQuery(
        writingQuestionQueries.list({ page, size: DEFAULT_PAGE_SIZE, questionTypes: selectedTypes })
    );

    const updateSelectedTypes = (next: WritingQuestionType[]) => {
        setSelectedTypes(ALL_QUESTION_TYPES.filter((type) => next.includes(type)));
        setPage(0);
    };

    const handleTypeToggle = (type: WritingQuestionType, checked: boolean) => {
        updateSelectedTypes(checked ? [...selectedTypes, type] : selectedTypes.filter((item) => item !== type));
    };

    const handleTaskToggle = (task: WritingTaskType, checked: boolean) => {
        const taskTypes = QUESTION_TYPES_BY_TASK[task];
        updateSelectedTypes(
            checked
                ? [...selectedTypes, ...taskTypes]
                : selectedTypes.filter((type) => !taskTypes.includes(type))
        );
    };

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateWritingAssignmentRequest) => writingAssignmentApi.createWritingAssignment(courseId, weekSectionId, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: weekSectionKeys.list(courseId) });
            message.success(t("createSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Errors = {};

        if (!selectedQuestion) newErrors.selectedQuestionError = t("errors.selectedQuestionRequired");
        if (!dueDate) newErrors.dueDateError = t("errors.dueDateRequired");
        if (!dueTime) newErrors.dueTimeError = t("errors.dueTimeRequired");

        setErrors(newErrors);

        if (!selectedQuestion || Object.keys(newErrors).length > 0) {
            return;
        }

        mutate({
            writingQuestionId: selectedQuestion.id,
            dueDate,
            dueTime,
            description: description.trim() || undefined,
        });
    }

    const columns: TableColumnsType<WritingQuestion> = [
        {
            dataIndex: "id",
            render: (_: string, record) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className="shrink-0"
                        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {record.imageUrl ? (
                            <Image
                                src={record.imageUrl}
                                alt={record.title}
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
                        <p className="truncate text-sm font-medium text-fg">{record.title}</p>
                        <Tooltip
                            placement="topLeft"
                            title={<span className="whitespace-pre-line">{record.prompt}</span>}
                        >
                            <p className="truncate text-sm text-muted">{record.prompt}</p>
                        </Tooltip>
                        <div className="mt-1 flex items-center gap-1.5">
                            <Tag variant="filled" color={TASK_TYPE_COLORS[record.taskType]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                {TASK_TYPE_LABELS[record.taskType]}
                            </Tag>
                            <Tag variant="filled" style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                {QUESTION_TYPE_LABELS[record.questionType]}
                            </Tag>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Modal
            title={t("title")}
            subtitle={t("subtitle")}
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-sm font-medium text-fg">
                    {t("writingLabel")}
                </p>

                <div className="rounded-xl border border-border bg-bg p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-fg">{t("filterPanel.title")}</p>

                        {selectedTypes.length > 0 && (
                            <button
                                type="button"
                                onClick={() => updateSelectedTypes([])}
                                className="cursor-pointer text-sm font-medium text-accent hover:underline"
                            >
                                {t("filterPanel.clear")}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        {TASK_TYPES.map((task) => {
                            const taskTypes = QUESTION_TYPES_BY_TASK[task];
                            const checkedCount = taskTypes.filter((type) => selectedTypes.includes(type)).length;

                            return (
                                <div key={task} className="flex items-start gap-3">
                                    <div className="w-20 flex-none">
                                        <Checkbox
                                            checked={checkedCount === taskTypes.length}
                                            indeterminate={checkedCount > 0 && checkedCount < taskTypes.length}
                                            onChange={(e) => handleTaskToggle(task, e.target.checked)}
                                        >
                                            <span className="text-sm font-semibold text-fg">{TASK_TYPE_LABELS[task]}</span>
                                        </Checkbox>
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-1.5 border-l border-border pl-3">
                                        {taskTypes.map((type) => (
                                            <Checkbox
                                                key={type}
                                                checked={selectedTypes.includes(type)}
                                                onChange={(e) => handleTypeToggle(type, e.target.checked)}
                                            >
                                                <span className="text-sm text-fg">{QUESTION_TYPE_LABELS[type]}</span>
                                            </Checkbox>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {isError ? (
                    <p className="text-sm text-red-500">{t("loadError")}</p>
                ) : (
                    <Table<WritingQuestion>
                        rowKey="id"
                        showHeader={false}
                        columns={columns}
                        dataSource={data?.content ?? []}
                        loading={isLoading}
                        tableLayout="fixed"
                        rowSelection={{
                            type: "radio",
                            columnWidth: 48,
                            selectedRowKeys: selectedQuestion ? [selectedQuestion.id] : [],
                            onChange: (_keys, rows) => setSelectedQuestion(rows[0] ?? null),
                        }}
                        onRow={(record) => ({
                            onClick: () => setSelectedQuestion(record),
                            className: "cursor-pointer",
                        })}
                        pagination={{
                            current: page + 1,
                            pageSize: DEFAULT_PAGE_SIZE,
                            total: data?.totalElements ?? 0,
                            showSizeChanger: false,
                            onChange: (p) => setPage(p - 1),
                        }}
                    />
                )}

                {errors.selectedQuestionError && (
                    <p className="text-sm text-red-500">{errors.selectedQuestionError}</p>
                )}

                {selectedQuestion && (
                    <p className="truncate text-sm text-muted">
                        {t("selected")}: <span className="font-medium text-fg">{selectedQuestion.title}</span>
                    </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <DateInput
                        label={t("dueDateLabel")}
                        value={dueDate}
                        onChange={setDueDate}
                        error={errors.dueDateError}
                    />

                    <TimeInput
                        label={t("dueTimeLabel")}
                        value={dueTime}
                        onChange={setDueTime}
                        error={errors.dueTimeError}
                    />
                </div>

                <TextInput
                    label={t("descriptionLabel")}
                    placeholder={t("descriptionPlaceholder")}
                    value={description}
                    onChange={setDescription}
                    type="textarea"
                    maxLength={1500}
                    rows={6}
                />

                <div className="flex justify-end">
                    <Button
                        label={t("submit")}
                        type="submit"
                        loading={isPending}
                    />
                </div>
            </form>
        </Modal>
    )
}