import { isNotFoundError } from "@/lib/api/error";
import { enrolledCourseQueries } from "@/lib/queries/courseQueries";
import { formatDateDDMMYYYY } from "@/lib/utils";
import { STATUS_TEXT_STYLE } from "@/types/course-type";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "antd";
import { useTranslations } from "next-intl";
import { notFound, useParams } from "next/navigation";

export default function StudentCourseHeader() {
    const { courseId } = useParams<{ courseId: string; }>();
    const t = useTranslations("studentCourseDetailPage.courseHeader");

    const { data: course, isLoading, error } = useQuery(enrolledCourseQueries.detail(courseId));

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

    const progressPercent = Math.min(Math.round((course.completedSessions / course.totalSessions) * 100), 100);

    return (
        <div className="rounded-2xl border border-border bg-bg p-6">
            <p className="font-serif text-2xl font-bold">{course.name}</p>

            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-5">
                <div className="min-w-30">
                    <p className="text-sm text-muted">{t("startDateLabel")}</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatDateDDMMYYYY(course.startDate)}</p>
                </div>
                <div className="min-w-30">
                    <p className="text-sm text-muted">{t("statusLabel")}</p>
                    <p className={`mt-0.5 text-sm font-semibold ${STATUS_TEXT_STYLE[course.status]}`}>{t(`status.${course.status}`)}</p>
                </div>
            </div>

            <div className="mt-5 flex min-w-0 flex-col gap-1.5 border-t border-border pt-5">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm text-muted">{t("progressLabel")}</p>
                    <p className="whitespace-nowrap text-sm font-bold">
                        {t("progressValue", { completed: course.completedSessions, total: course.totalSessions })}
                    </p>
                </div>
                <Progress percent={progressPercent} showInfo={false} />
            </div>
        </div>
    );
}