import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Image, Table, TableColumnsType, Tag, Tooltip } from "antd";
import Button from "../Button";
import { useAppMessage } from "@/contexts/message-context";
import { DIFFICULTY_COLORS, TASK_TYPE_COLORS, WritingQuestion, WritingTaskType } from "@/types/writing-question-type";
import { WritingQuestionApi } from "@/lib/api/writingQuestionApi";
import DateInput from "../form-input/DateInput";
import TimeInput from "../form-input/TimeInput";
import TextInput from "../form-input/TextInput";
import { CreateWritingAssignmentRequest } from "@/types/writing-assignment-type";
import { writingAssignmentApi } from "@/lib/api/writingAssignmentApi";

type Filter = "ALL" | WritingTaskType;

const FILTERS: Filter[] = ["ALL", "TASK_1", "TASK_2"];
const DEFAULT_PAGE_SIZE = 5;
const THUMB_SIZE = 64;

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
    const t = useTranslations("teacherCourseDetailPage.createWritingAssignmentModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [selectedQuestion, setSelectedQuestion] = useState<WritingQuestion | null>(null);
    const [dueDate, setDueDate] = useState<string>("");
    const [dueTime, setDueTime] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [errors, setErrors] = useState<Errors>({});

    const [filter, setFilter] = useState<Filter>("ALL");
    const [page, setPage] = useState<number>(0);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["writing-questions", page, filter],
        queryFn: () => WritingQuestionApi.list({
            page,
            size: DEFAULT_PAGE_SIZE,
            taskType: filter === "ALL" ? undefined : filter,
        }),
        placeholderData: keepPreviousData,
        enabled: isOpen
    });

    const handleFilterChange = (key: Filter) => {
        setFilter(key);
        setPage(0);
    };

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateWritingAssignmentRequest) => writingAssignmentApi.createWritingAssignment(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["course", courseId] })
            message.success(t("createSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    })

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
            weekSectionId: weekSectionId,
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
                        className="shrink-0 overflow-hidden rounded-md bg-gray-100"
                        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {record.imageUrl ? (
                            <Image
                                src={record.imageUrl}
                                alt={record.title}
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

                    <Tooltip
                        placement="topLeft"
                        title={<span className="whitespace-pre-line">{record.prompt}</span>}
                    >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <p className="truncate text-sm font-medium text-fg">{record.title}</p>
                            <p className="truncate text-sm text-muted">{record.prompt}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <Tag variant="filled" color={TASK_TYPE_COLORS[record.taskType]} style={{ marginInlineEnd: 0, fontSize: 14}}>
                                    {t(`taskType.${record.taskType}`)}
                                </Tag>
                                <Tag variant="filled" color={DIFFICULTY_COLORS[record.difficulty]} style={{ marginInlineEnd: 0,  fontSize: 14 }}>
                                    {t(`difficulty.${record.difficulty}`)}
                                </Tag>
                            </div>
                        </div>
                    </Tooltip>
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

                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((key) => {
                        const isActive = key === filter;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleFilterChange(key)}
                                className={`inline-flex h-7.5 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
                                    isActive
                                        ? "border-accent bg-accent text-white"
                                        : "border-border bg-bg text-muted hover:border-muted hover:text-fg"
                                }`}
                            >
                                {t(`filters.${key}`)}
                            </button>
                        )
                    })}
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