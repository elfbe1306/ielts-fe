"use client";

import Button from "@/components/Button";
import CourseCard from "@/components/course/CourseCard";
import PlusIcon from "@/components/icons/PlusIcon";
import CreateCourseModal from "@/components/modals/CreateCourseModal";
import { teacherCourseApi } from "@/lib/api/teacher/teacherCourseApi";
import { CourseStatus } from "@/types/course-type";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
import { useTranslations } from "next-intl"
import { useState } from "react";

type Filter = "ALL" | CourseStatus;

const FILTERS: Filter[] = ["ALL", "UPCOMING", "ACTIVE", "ENDED"];
const PAGE_SIZE = 9;

export default function TeacherCoursesPage() {
    const t = useTranslations("teacherCoursesPage");

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filter, setFilter] = useState<Filter>("ALL");
    const [page, setPage] = useState<number>(0);

    const { data, isLoading, isPlaceholderData, error } = useQuery({
        queryKey: ["courses", page, filter],
        queryFn: () => teacherCourseApi.listCourses({
            page,
            size: PAGE_SIZE,
            status: filter === "ALL" ? undefined : filter,
        }),
        placeholderData: keepPreviousData,
    });

    const courses = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;

    const handleFilterChange = (key: Filter) => {
        setFilter(key);
        setPage(0);
    };

    return (
        <>
            <div className="flex items-center justify-between">
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
                    onClick={() => setIsOpen(true)}
                />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
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

            <div className="mt-6">
                {isLoading && (
                    <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-surface" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-error/40 bg-error-bg px-6 py-10 text-center text-sm text-error">
                        {error.message}
                    </div>
                )}

                {!isLoading && courses.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                        <p className="font-serif text-base font-bold">
                            {filter === "ALL" ? t("emptyTitle") : t("noMatchTitle")}
                        </p>
                        <p className="max-w-xs text-sm text-muted">
                            {filter === "ALL" ? t("emptySubtitle") : t("noMatchSubTitle")}
                        </p>
                    </div>
                )}

                {courses.length > 0 && (
                    <div className={`grid grid-cols-1 gap-4.5 md:grid-cols-2 lg:grid-cols-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}

                {totalElements > PAGE_SIZE && (
                    <div className="mt-6 flex justify-center">
                        <Pagination
                            current={page + 1}
                            pageSize={PAGE_SIZE}
                            total={totalElements}
                            onChange={(uiPage) => setPage(uiPage - 1)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>

            {isOpen && (
                <CreateCourseModal 
                    isOpen={isOpen} 
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    )
}