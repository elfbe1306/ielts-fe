"use client";

import { WritingQuestionFilter } from "@/types/writing-question-type";
import { useTranslations } from "next-intl";
import { useState } from "react";

const FILTERS: WritingQuestionFilter[] = ["ALL", "TASK_1", "TASK_2"];
const DEFAULT_PAGE_SIZE = 12;

export default function WritingPracticesPage() {
    const t = useTranslations("writing");

    const [filter, setFilter] = useState<WritingQuestionFilter>("ALL");
    const [page, setPage] = useState<number>(0);

    const handleFilterChange = (key: WritingQuestionFilter) => {
        setFilter(key);
        setPage(0);
    };

    return (
        <>
            <div>
                <h1 className="font-serif font-bold text-2xl mb-1">
                    {t("title")}
                </h1>
                <p className="text-muted text-sm">
                    {t("subtitle")}
                </p>
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
        </>
    )
}