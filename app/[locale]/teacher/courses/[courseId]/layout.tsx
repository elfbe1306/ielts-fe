"use client";

import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import { Breadcrumb } from "antd";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function TeacherCourseDetailLayout({ children }: { children: React.ReactNode }) {
    const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId?: string }>();
    const t = useTranslations("teacherCourseDetailPage");

    const breadcrumbItems = [
        {
            title: t("breadcrumbs.courses"),
            path: ROUTES.teacher.courses,
        },
        {
            title: t("breadcrumbs.detail"),
            path: ROUTES.teacher.courseDetail(courseId)
        },
    ];

    if (assignmentId) {
        breadcrumbItems.push({
            title: t("breadcrumbs.writingAssignment"),
            path: ROUTES.teacher.writingAssignment(courseId, assignmentId),
        });
    }

    return (
        <>
            <Breadcrumb
                items={breadcrumbItems}
                itemRender={(currentRoute) => {
                    const isFirst = currentRoute.path === breadcrumbItems[0].path;
                    const isLast = currentRoute.path === breadcrumbItems[breadcrumbItems.length - 1].path;

                    const content = (
                        <span className="group inline-flex items-center gap-1.5">
                            {isFirst && (
                                <ArrowLeftIcon width={16} height={16} className="text-muted transition-colors group-hover:text-accent" />
                            )}
                            <span>{currentRoute.title}</span>
                        </span>
                    );

                    return isLast ? (
                        <>{content}</>
                    ) : (
                        <Link href={currentRoute.path as string}>{content}</Link>
                    );
                }}
            />

            <div className="mt-4">
                {children}
            </div>
        </>
    );
}