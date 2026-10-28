import { useLocale, useTranslations } from "next-intl";
import Button from "../Button";
import { Popconfirm } from "antd";
import { formatDayMonth, formatTime, parseLocalDate, todayIso } from "@/lib/utils";
import { useState } from "react";
import { useAppMessage } from "@/contexts/message-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WeekSection } from "@/types/week-section-type";
import TrashIcon from "../icons/TrashIcon";
import PencilIcon from "../icons/PencilIcon";
import PlusIcon from "../icons/PlusIcon";
import { teacherWeekSectionApi } from "@/lib/api/teacher/teacherWeekSectionApi";
import UpdateWeekSectionModal from "../modals/UpdateWeekSectionModal";
import CreateWritingAssignmentModal from "../modals/CreateWritingAssignmentModal";
import AssignmentList from "./AssignmentList";

type WeekSectionCardProps = {
    courseId: string;
    weekSection: WeekSection;
}

export default function WeekSectionCard({ courseId, weekSection } : WeekSectionCardProps) {
    const t = useTranslations("teacherCourseDetailPage.weekSectionCard");
    const locale = useLocale();
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const today = todayIso();

    const [isUpdateWeekSectionModalOpen, setIsUpdateWeekSectionModalOpen] = useState<boolean>(false);
    const [isCreateWritingAssignmentModalOpen, setIsCreateWritingAssignmentModalOpen] = useState<boolean>(false);

    const { mutateAsync } = useMutation({
        mutationFn: () => teacherWeekSectionApi.deleteWeekSection(weekSection.id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
            message.success(t("deleteSuccess"));
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const writingAssignments = weekSection.writingAssignments ?? [];

    return (
        <div className="flex flex-col gap-3 rounded-xl bg-bg border border-border p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-fg">{weekSection.weekName}</p>
                    <p className="text-sm text-muted">
                        {t("sessionCount", { count: weekSection.sessions.length })}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        label=""
                        type="button"
                        variant="secondary"
                        icon={<PencilIcon width={18} height={18} />}
                        iconOnly={true}
                        onClick={() => setIsUpdateWeekSectionModalOpen(true)}
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

            <div className="grid grid-cols-2 gap-2 border-b border-border pb-4 sm:grid-cols-4 lg:grid-cols-7">
                {weekSection.sessions.map((session) => {
                    const isToday = session.date === today;
                    const isPast = session.date < today;

                    return (
                        <div
                            key={session.id}
                            className={[
                                "flex flex-col gap-0.5 rounded-lg border px-3 py-2 transition-colors",
                                isToday ? "border-accent bg-accent/5" : "border-border",
                                isPast ? "opacity-50" : "",
                            ].join(" ")}
                        >
                            <div className="flex items-baseline gap-1.5">
                                <p className={`text-sm font-medium uppercase ${isToday ? "text-accent" : "text-muted"}`}>
                                    {weekdayFormatter.format(parseLocalDate(session.date))}
                                </p>
                                <p className="text-sm font-semibold text-fg">
                                    {formatDayMonth(session.date)}
                                </p>
                            </div>

                            <p className="text-sm tabular-nums text-muted">
                                {formatTime(session.startTime)}–{formatTime(session.endTime)}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                        {t("assignments.title")}
                    </p>

                    <Button
                        type="button"
                        variant="tertiary"
                        label={t("assignments.addButton")}
                        icon={<PlusIcon className="text-accent" width={18} height={18} />}
                        onClick={() => setIsCreateWritingAssignmentModalOpen(true)}
                    />
                </div>

                {writingAssignments.length > 0 ? (
                    <AssignmentList 
                        courseId={courseId}
                        writingAssignments={writingAssignments} 
                    />
                ) : (
                    <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted">
                        {t("assignments.empty")}
                    </p>
                )}
            </div>

            {isUpdateWeekSectionModalOpen && (
                <UpdateWeekSectionModal
                    isOpen={isUpdateWeekSectionModalOpen}
                    onClose={() => setIsUpdateWeekSectionModalOpen(false)}
                    courseId={courseId}
                    weekSection={weekSection}
                />
            )}

            {isCreateWritingAssignmentModalOpen && (
                <CreateWritingAssignmentModal
                    isOpen={isCreateWritingAssignmentModalOpen}
                    onClose={() => setIsCreateWritingAssignmentModalOpen(false)}
                    courseId={courseId}
                    weekSectionId={weekSection.id}
                />
            )}
        </div>
    );
}