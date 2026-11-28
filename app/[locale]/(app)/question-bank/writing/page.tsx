"use client";

import Button from "@/components/Button";
import AlignLeftIcon from "@/components/icons/AlignLeftIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import CreateWritingQuestionModal from "@/components/modals/CreateWritingQuestionModal";
import UpdateWritingQuestionModal from "@/components/modals/UpdateWritingQuestionModal";
import { useAppMessage } from "@/contexts/message-context";
import { writingQuestionApi } from "@/lib/api/writingQuestionApi";
import { writingQuestionKeys, writingQuestionQueries } from "@/lib/queries/writingQuestionQueries";
import { QUESTION_TYPE_LABELS, QUESTION_TYPES_BY_TASK, TASK_TYPE_COLORS, TASK_TYPE_LABELS, TASK_TYPES, WritingQuestion, WritingQuestionType, WritingTaskType } from "@/types/writing-question-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox, Image, Popconfirm, Table, TableColumnsType, Tag, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 10;
const ALL_QUESTION_TYPES: WritingQuestionType[] = TASK_TYPES.flatMap((task) => [...QUESTION_TYPES_BY_TASK[task]]);

export default function WritingQuestionBankPage() {
    const t = useTranslations("writingQuestionBank");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
    const [selectedQuestion, setSelectedQuestion] = useState<WritingQuestion | null>(null);

    const [selectedTypes, setSelectedTypes] = useState<WritingQuestionType[]>([]);
    const [page, setPage] = useState<number>(0);

    const { data, isLoading, isError } = useQuery(
        writingQuestionQueries.list({ page, size: DEFAULT_PAGE_SIZE, questionTypes: selectedTypes })
    );

    const { mutateAsync } = useMutation({
        mutationFn: (id: string) => writingQuestionApi.delete(id),
        onSuccess: async () => {
            if (page > 0 && data?.content.length === 1) {
                setPage(page - 1);
            }
            await queryClient.invalidateQueries({ queryKey: writingQuestionKeys.lists() });
            message.success(t("deleteSuccess"));
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleEditClick = (question: WritingQuestion) => {
        setSelectedQuestion(question);
        setUpdateModalOpen(true);
    };

    const handleUpdateModalClose = () => {
        setUpdateModalOpen(false);
        setSelectedQuestion(null);
    };

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

    const columns: TableColumnsType<WritingQuestion> = [
        {
            title: t("columns.question"),
            dataIndex: "title",
            render: (_: string, record) => (
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-none">
                        {record.imageUrl ? (
                            <Image
                                src={record.imageUrl}
                                alt=""
                                width={64}
                                height={64}
                                style={{ objectFit: "cover", borderRadius: 10, border: "1px solid var(--color-border)" }}
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-[10px] border border-border bg-surface text-muted">
                                <AlignLeftIcon width={22} height={22} />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-fg">{record.title}</p>
                        <Tooltip
                            placement="topLeft"
                            title={<span className="whitespace-pre-line">{record.prompt}</span>}
                        >
                            <p className="mt-0.5 truncate text-sm text-muted">{record.prompt}</p>
                        </Tooltip>
                        <div className="mt-2 flex items-center gap-2">
                            <Tag color={TASK_TYPE_COLORS[record.taskType]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                {TASK_TYPE_LABELS[record.taskType]}
                            </Tag>
                            <Tag style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                {QUESTION_TYPE_LABELS[record.questionType]}
                            </Tag>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: t("columns.action"),
            key: "action",
            align: "center",
            width: 120,
            render: (_, record) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        label=""
                        type="button"
                        variant="secondary"
                        icon={<PencilIcon width={16} height={16} />}
                        iconOnly={true}
                        onClick={() => handleEditClick(record)}
                    />

                    <Popconfirm
                        title={t("deletePopconfirm.title")}
                        description={t("deletePopconfirm.subtitle")}
                        placement="bottomRight"
                        okText={t("deletePopconfirm.okText")}
                        cancelText={t("deletePopconfirm.cancelText")}
                        okButtonProps={{ style: { cursor: "pointer" } }}
                        cancelButtonProps={{ style: { cursor: "pointer" } }}
                        onConfirm={() => mutateAsync(record.id).catch(() => {})}                                
                    >
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-bg text-muted transition-colors cursor-pointer hover:border-error hover:bg-error-bg hover:text-error"
                        >
                            <TrashIcon width={16} height={16} />
                        </button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="font-serif font-bold text-2xl mb-1">
                        {t("title")}
                    </h1>
                    <p className="text-muted text-sm">
                        {t("subtitle")}
                    </p>
                </div>

                <Button
                    variant="primary"
                    label={t("createButton")}
                    icon={<PlusIcon className="text-white" width={20} height={20}/>}
                    onClick={() => setCreateModalOpen(true)}
                />
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="w-full flex-none rounded-2xl border border-border bg-bg p-5 lg:w-64">                    
                    <div className="mb-4 flex items-center justify-between">
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

                    <div className="flex flex-col gap-5">
                        {TASK_TYPES.map((task) => {
                            const taskTypes = QUESTION_TYPES_BY_TASK[task];
                            const checkedCount = taskTypes.filter((type) => selectedTypes.includes(type)).length;

                            return (
                                <div key={task} className="flex flex-col gap-2">
                                    <Checkbox
                                        checked={checkedCount === taskTypes.length}
                                        indeterminate={checkedCount > 0 && checkedCount < taskTypes.length}
                                        onChange={(e) => handleTaskToggle(task, e.target.checked)}
                                    >
                                        <span className="text-sm font-semibold text-fg">{TASK_TYPE_LABELS[task]}</span>
                                    </Checkbox>

                                    <div className="flex flex-col gap-1.5 pl-6">
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

                <div className="min-w-0 flex-1">
                    {isError ? (
                        <p className="text-sm text-red-500">{t("loadError")}</p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-bg">
                            <Table<WritingQuestion>
                                rowKey="id"
                                columns={columns}
                                dataSource={data?.content ?? []}
                                loading={isLoading}
                                tableLayout="fixed"
                                pagination={{
                                    current: page + 1,
                                    pageSize: DEFAULT_PAGE_SIZE,
                                    total: data?.totalElements ?? 0,
                                    showSizeChanger: false,
                                    onChange: (p) => setPage(p - 1),
                                    style: { paddingInline: 16 },
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateWritingQuestionModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setCreateModalOpen(false)}
                />
            )}

            {selectedQuestion && isUpdateModalOpen && (
                <UpdateWritingQuestionModal
                    question={selectedQuestion}
                    isOpen={isUpdateModalOpen}
                    onClose={handleUpdateModalClose}
                />
            )}
        </>
    )
}