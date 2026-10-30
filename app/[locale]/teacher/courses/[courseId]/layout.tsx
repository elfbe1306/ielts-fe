"use client";

import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { TeacherCourseProvider } from "@/contexts/teacher-course-context";
import { Link } from "@/i18n/navigation";
import { isNotFoundError } from "@/lib/api/error";
import { teacherCourseApi } from "@/lib/api/teacher/teacherCourseApi";
import { ROUTES } from "@/lib/route";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "antd";
import { useTranslations } from "next-intl";
import { notFound, useParams } from "next/navigation";

export default function TeacherCourseDetailLayout({ children }: { children: React.ReactNode }) {
    const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId?: string }>();
    const t = useTranslations("teacherCourseDetailPage");

    const { data: course, isLoading, error } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => teacherCourseApi.getCourse(courseId),
    });

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

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />;
    }

    if (error) {
        if (isNotFoundError(error)) {
            notFound();
        }
    
        return (
            <div className="rounded-2xl border border-error/40 bg-error-bg px-6 py-10 text-center text-sm text-error">
                {error.message}
            </div>
        );
    }

    if (!course) return null;

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
                <TeacherCourseProvider course={course}>
                    {children}
                </TeacherCourseProvider>
            </div>
        </>
    );
}