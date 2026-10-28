"use client";

import { CourseStatus } from "@/types/course-type";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Filter = "ALL" | CourseStatus;

const FILTERS: Filter[] = ["ALL", "UPCOMING", "ACTIVE", "ENDED"];
const PAGE_SIZE = 9;

export default function StudentCoursesPage() {
    const t = useTranslations("studentCoursesPage");

    const [filter, setFilter] = useState<Filter>("ALL");
    const [page, setPage] = useState<number>(0);

    // const { data, isLoading, isPlaceholderData, error } = useQuery({
    //     queryKey: ["courses", page, filter],
    //     queryFn: () => courseApi.listEnrolled({
    //         page,
    //         size: PAGE_SIZE,
    //         status: filter === "ALL" ? undefined : filter,
    //     }),
    //     placeholderData: keepPreviousData,
    // });

    // const courses = data?.content ?? [];
    // const totalElements = data?.totalElements ?? 0;

    const handleFilterChange = (key: Filter) => {
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
        </>
    )
}