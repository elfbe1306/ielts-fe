"use client";

import Button from "@/components/Button";
import PencilIcon from "@/components/icons/PencilIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import CreateWritingQuestionModal from "@/components/modals/CreateWritingQuestionModal";
import UpdateWritingQuestionModal from "@/components/modals/UpdateWritingQuestionModal";
import { useAppMessage } from "@/contexts/message-context";
import { teacherWritingQuestionApi } from "@/lib/api/teacher/teacherWritingQuestionApi";
import { DIFFICULTY_COLORS, TASK_TYPE_COLORS, WritingDifficulty, WritingQuestion, WritingTaskType } from "@/types/writing-question-type";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image, Popconfirm, Table, TableColumnsType, Tag, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Filter = "ALL" | WritingTaskType;

const FILTERS: Filter[] = ["ALL", "TASK_1", "TASK_2"];
const DEFAULT_PAGE_SIZE = 10;

export default function TeacherQuestionBankWritingPage() {
    const t = useTranslations("teacherQuestionBankWritingPage");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
    const [selectedQuestion, setSelectedQuestion] = useState<WritingQuestion | null>(null);

    const [filter, setFilter] = useState<Filter>("ALL");
    const [page, setPage] = useState<number>(0);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["writing-questions", page, filter],
        queryFn: () => teacherWritingQuestionApi.list({
            page,
            size: DEFAULT_PAGE_SIZE,
            taskType: filter === "ALL" ? undefined : filter,
        }),
        placeholderData: keepPreviousData
    });

    const { mutateAsync } = useMutation({
        mutationFn: (id: string) => teacherWritingQuestionApi.delete(id),
        onSuccess: async () => {
            if (page > 0 && data?.content.length === 1) {
                setPage(page - 1);
            }
            await queryClient.invalidateQueries({ queryKey: ["writing-questions"] });
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

    const handleFilterChange = (key: Filter) => {
        setFilter(key);
        setPage(0);
    };

    const columns: TableColumnsType<WritingQuestion> = [
        {
            title: t("columns.question"),
            dataIndex: "title",
            ellipsis: { showTitle: false },
            render: (_: string, record) => (
                <Tooltip
                    placement="topLeft"
                    title={<span className="whitespace-pre-line">{record.prompt}</span>}
                >
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">{record.title}</p>
                        <p className="truncate text-sm text-muted">{record.prompt}</p>
                    </div>
                </Tooltip>
            ),
        },
        {
            title: t("columns.taskType"),
            dataIndex: "taskType",
            align: "center",
            width: "10%",
            render: (taskType: WritingTaskType) => (
                <Tag color={TASK_TYPE_COLORS[taskType]} style={{ marginInlineEnd: 0 }}>
                    {t(`taskType.${taskType}`)}
                </Tag>
            ),
        },
        {
            title: t("columns.difficulty"),
            dataIndex: "difficulty",
            align: "center",
            width: "10%",
            render: (difficulty: WritingDifficulty) => (
                <Tag color={DIFFICULTY_COLORS[difficulty]} style={{ marginInlineEnd: 0 }}>
                    {t(`difficulty.${difficulty}`)}
                </Tag>
            ),
        },
        {
            title: t("columns.image"),
            dataIndex: "imageUrl",
            align: "center",
            width: "15%",
            render: (imageUrl: string | null) =>
                imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt=""
                        width={48}
                        height={48}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                ) : (
                    <span className="text-muted">—</span>
                ),
        },
        {
            title: t("columns.action"),
            key: "action",
            align: "center",
            width: "10%",
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

            <div className="mt-6 mb-6 flex flex-wrap gap-2">
                {FILTERS.map((key) => {
                    const isActive = key === filter;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleFilterChange(key)}
                            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
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
                    bordered={true}
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
                    }}
                />
            )}

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