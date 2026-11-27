"use client";

import AppBreadcrumb, { BreadcrumbItem } from "@/components/AppBreadcrumb";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function CourseDetailLayout({ children } : { children: React.ReactNode }) {
    const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId?: string }>();
    const t = useTranslations("courseDetail");

    const breadcrumbItems: BreadcrumbItem[] = [
        {
            title: t("breadcrumbs.courses"),
            path: ROUTES.courses,
        },
        {
            title: t("breadcrumbs.detail"),
            path: ROUTES.courseDetail(courseId)
        },
    ];

    if (assignmentId) {
        breadcrumbItems.push({
            title: t("breadcrumbs.writingAssignment"),
            path: ROUTES.writingAssignment(courseId, assignmentId),
        });
    }

    return (
        <>
            <AppBreadcrumb items={breadcrumbItems} />

            <div className="mt-4">
                {children}
            </div>
        </>
    );
}