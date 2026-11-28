"use client";

import AlignLeftIcon from "@/components/icons/AlignLeftIcon";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import { Link } from "@/i18n/navigation";
import { writingQuestionQueries } from "@/lib/queries/writingQuestionQueries";
import { ROUTES } from "@/lib/route";
import { QUESTION_TYPE_LABELS, QUESTION_TYPES_BY_TASK, TASK_TYPE_COLORS, TASK_TYPE_LABELS, TASK_TYPES, WritingQuestionType, WritingTaskType } from "@/types/writing-question-type";
import { useQuery } from "@tanstack/react-query";
import { Checkbox, Image, Pagination, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 12;
const ALL_QUESTION_TYPES: WritingQuestionType[] = TASK_TYPES.flatMap((task) => [...QUESTION_TYPES_BY_TASK[task]]);

export default function WritingPracticesPage() {
    const t = useTranslations("writing");

    const [selectedTypes, setSelectedTypes] = useState<WritingQuestionType[]>([]);
    const [page, setPage] = useState<number>(0);

    const { data, isLoading, isError, isPlaceholderData } = useQuery(
        writingQuestionQueries.list({ page, size: DEFAULT_PAGE_SIZE, questionTypes: selectedTypes })
    );

    const questions = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;

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

    return (
        <>
            <div className="mb-4">
                <h1 className="font-serif font-bold text-2xl mb-1">
                    {t("title")}
                </h1>
                <p className="text-muted text-sm">
                    {t("subtitle")}
                </p>
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
                    {isLoading && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-surface" />
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div className="rounded-2xl border border-error/40 bg-error-bg px-6 py-10 text-center text-sm text-error">
                            {t("loadError")}
                        </div>
                    )}

                    {!isLoading && !isError && questions.length === 0 && (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                            <p className="font-serif text-base font-bold">{t("emptyTitle")}</p>
                            <p className="max-w-xs text-sm text-muted">{t("emptySubtitle")}</p>
                        </div>
                    )}

                    {questions.length > 0 && (
                        <div className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isPlaceholderData ? "opacity-60" : ""}`}>
                            {questions.map((question) => (
                                <Link
                                    key={question.id}
                                    href={`${ROUTES.practices.writing}/${question.id}`}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                                >
                                    <div className="h-36 flex-none border-b border-border bg-surface">
                                        {question.imageUrl ? (
                                            <Image
                                                src={question.imageUrl}
                                                alt={question.title}
                                                preview={false}
                                                width="100%"
                                                height="100%"
                                                style={{ objectFit: "cover" }}
                                                rootClassName="block h-full w-full"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted">
                                                <AlignLeftIcon width={32} height={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2 p-4">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Tag color={TASK_TYPE_COLORS[question.taskType]} style={{ marginInlineEnd: 0, fontSize: 13 }}>
                                                {TASK_TYPE_LABELS[question.taskType]}
                                            </Tag>
                                            <Tag style={{ marginInlineEnd: 0, fontSize: 13 }}>
                                                {QUESTION_TYPE_LABELS[question.questionType]}
                                            </Tag>
                                        </div>

                                        <p className="line-clamp-2 text-base font-semibold text-fg">{question.title}</p>
                                        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{question.prompt}</p>

                                        <div className="mt-auto flex items-center justify-end border-t border-border pt-3">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                                                {t("start")}
                                                <ArrowRightIcon width={16} height={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {totalElements > DEFAULT_PAGE_SIZE && (
                        <div className="mt-6 flex justify-center">
                            <Pagination
                                current={page + 1}
                                pageSize={DEFAULT_PAGE_SIZE}
                                total={totalElements}
                                onChange={(p) => setPage(p - 1)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}