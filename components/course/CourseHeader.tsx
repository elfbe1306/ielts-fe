import { Popconfirm, Progress } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatDateDDMMYYYY } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppMessage } from "@/contexts/message-context";
import { STATUS_STYLE } from "@/types/course-type";
import { useRouter } from "@/i18n/navigation";
import { teacherCourseApi } from "@/lib/api/teacher/teacherCourseApi";
import { ROUTES } from "@/lib/route";
import Button from "../Button";
import PencilIcon from "../icons/PencilIcon";
import TrashIcon from "../icons/TrashIcon";
import UpdateCourseModal from "../modals/UpdateCourseModal";
import { useTeacherCourse } from "@/contexts/teacher-course-context";

export default function CourseHeader() {
    const course = useTeacherCourse();
    const t = useTranslations("teacherCourseDetailPage.courseHeader");
    const message = useAppMessage();
    const queryClient = useQueryClient();
    const router = useRouter(); 

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    
    const progressPercent = Math.min(Math.round((course.completedSessions / course.totalSessions) * 100), 100);

    const { mutateAsync } = useMutation({
        mutationFn: () => teacherCourseApi.deleteCourse(course.id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["courses"] });
            message.success(t("deleteSuccess"));
            router.replace(ROUTES.teacher.courses);
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    return (
        <div className="rounded-2xl border border-border bg-bg p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-serif text-2xl font-bold">{course.name}</p>

                <div className="flex flex-none items-center gap-2">
                    <p className={`inline-flex h-7 flex-none items-center whitespace-nowrap rounded-full px-3 text-sm font-medium ${STATUS_STYLE[course.status]}`}>
                        {t(`status.${course.status}`)}
                    </p>

                    <Button
                        label=""
                        type="button"
                        variant="secondary"
                        icon={<PencilIcon width={18} height={18} />}
                        iconOnly={true}
                        onClick={() => setIsUpdateModalOpen(true)}
                    />

                    <Popconfirm
                        title={t("deletePopconfirm.title")}
                        description={t("deletePopconfirm.subtitle")}
                        placement="bottomRight"
                        okText={t("deletePopconfirm.okText")}
                        cancelText={t("deletePopconfirm.cancelText")}
                        okButtonProps={{ style: { cursor: "pointer" } }}
                        cancelButtonProps={{ style: { cursor: "pointer" } }}
                        onConfirm={() => mutateAsync().catch(() => {})}                                
                    >
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-bg text-muted transition-colors cursor-pointer hover:border-error hover:bg-error-bg hover:text-error"
                        >
                            <TrashIcon width={18} height={18} />
                        </button>
                    </Popconfirm>
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
                    <p className="text-muted text-sm">{t("capacityLabel")}</p>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                        <p>{course.enrolledCount}</p>
                        <p> / </p>
                        <p>{t("capacityValue", { min: course.minStudents, max: course.maxStudents })}</p>
                    </div>
                </div>
                <div className="min-w-30">
                    <p className="text-sm text-muted">{t("scheduledWeeksLabel")}</p>
                    <p className="mt-0.5 text-sm font-semibold">{course.weekSections.length}</p>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-1.5 border-t border-border pt-5">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm text-muted">{t("progressLabel")}</p>
                    <p className="whitespace-nowrap text-sm font-bold">
                        {t("progressValue", { completed: course.completedSessions, total: course.totalSessions })}
                    </p>
                </div>
                <Progress percent={progressPercent} showInfo={false} />
            </div>

            {isUpdateModalOpen && (
                <UpdateCourseModal
                    course={course}
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                />
            )}
        </div>
    );
}