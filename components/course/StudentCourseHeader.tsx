import { formatDateDDMMYYYY } from "@/lib/utils";
import { STATUS_STYLE, StudentCourse } from "@/types/course-type";
import { Progress } from "antd";
import { useTranslations } from "next-intl";

type StudentCourseHeaderProps = {
    course: StudentCourse;
}

export default function StudentCourseHeader({ course }: StudentCourseHeaderProps) {
    const t = useTranslations("studentCourseDetailPage.courseHeader");

    const progressPercent = Math.min(Math.round((course.completedSessions / course.totalSessions) * 100), 100);

    return (
        <div className="rounded-2xl border border-border bg-bg p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-serif text-2xl font-bold">{course.name}</p>

                <div className="flex flex-none items-center gap-2">
                    <p className={`inline-flex h-7 flex-none items-center whitespace-nowrap rounded-full px-3 text-sm font-medium ${STATUS_STYLE[course.status]}`}>
                        {t(`status.${course.status}`)}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-5">
                <div className="min-w-30">
                    <p className="text-sm text-muted">{t("teacherLabel")}</p>
                    <p className="mt-0.5 text-sm font-semibold">{"Huynh Ngoc Nhon"}</p>
                </div>
                <div className="min-w-30">
                    <p className="text-sm text-muted">{t("startDateLabel")}</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatDateDDMMYYYY(course.startDate)}</p>
                </div>
                <div className="min-w-30">
                    <p className="text-sm text-muted">{t("scheduledWeeksLabel")}</p>
                    <p className="mt-0.5 text-sm font-semibold">{course.weekSections.length}</p>
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