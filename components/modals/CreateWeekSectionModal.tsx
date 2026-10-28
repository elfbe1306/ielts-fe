import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useState } from "react";
import Button from "../Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppMessage } from "@/contexts/message-context";
import { addDays, formatTime } from "@/lib/utils";
import { ClassSession, CreateWeekSectionRequest, SessionErrors } from "@/types/week-section-type";
import { Course } from "@/types/course-type";
import { teacherWeekSectionApi } from "@/lib/api/teacher/teacherWeekSectionApi";
import TextInput from "../form-input/TextInput";
import WeekCard from "../course/WeekCard";

const MIN_SESSIONS = 1;
const MAX_SESSIONS = 7;

const emptySession = (): ClassSession => ({
    id: crypto.randomUUID(),
    date: "",
    startTime: "",
    endTime: "",
});

type CreateWeekSectionModalProps = {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
}

type Errors = {
    weekName?: string;
    sessions?: Record<string, SessionErrors>;
}

export default function CreateWeekSectionModal({ course, isOpen, onClose } : CreateWeekSectionModalProps) {
    const t = useTranslations("teacherCourseDetailPage.createWeekSectionModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const previousWeek = course.weekSections.at(-1);

    const [weekName, setWeekName] = useState<string>(() => t("defaultWeekName", { number: course.weekSections.length + 1 }));
    const [sessionCount, setSessionCount] = useState<number | "">(MIN_SESSIONS);
    const [sessions, setSessions] = useState<ClassSession[]>(() => [emptySession()]);

    const [errors, setErrors] = useState<Errors>({});

    const handleSessionCountChange = (value: number | "") => {
        if (value === "") {
            setSessionCount("");
            return;
        }

        const count = Math.min(Math.max(Math.floor(value), MIN_SESSIONS), MAX_SESSIONS);
        setSessionCount(count);

        setSessions(prev => {
            if (count > prev.length) {
                return [...prev, ...Array.from({ length: count - prev.length }, emptySession)];
            }
            return prev.slice(0, count);
        });
    }

    const handleDeleteSession = (id: string) => {
        if (sessions.length <= MIN_SESSIONS) return;

        const next = sessions.filter(s => s.id !== id);
        setSessions(next);
        setSessionCount(next.length);
    }

    const handleSessionChange = (id: string, value: ClassSession) => {
        setSessions(prev => prev.map(s => (s.id === id ? value : s)));
    }

    const handleCopyFromPreviousWeek = () => {
        if (!previousWeek) return;

        const copied: ClassSession[] = previousWeek.sessions.map((s) => ({
            id: crypto.randomUUID(),
            date: addDays(s.date, 7),
            startTime: formatTime(s.startTime),
            endTime: formatTime(s.endTime),
        }));

        setSessions(copied);
        setSessionCount(copied.length);
        setErrors(prev => ({ ...prev, sessions: undefined }));
    }

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateWeekSectionRequest) => teacherWeekSectionApi.createWeekSection(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["course", course.id] })
            message.success(t("createSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Errors = {};

        if (!weekName.trim()) {
            newErrors.weekName = t("errors.weekNameRequired");
        }

        const sessionErrors: Record<string, SessionErrors> = {};

        for (const session of sessions) {
            const err: SessionErrors = {};

            if (!session.date) err.date = t("errors.dateRequired");
            if (!session.startTime) err.startTime = t("errors.startTimeRequired");
            if (!session.endTime) err.endTime = t("errors.endTimeRequired");

            if (Object.keys(err).length > 0) {
                sessionErrors[session.id] = err;
            }
        }

        if (Object.keys(sessionErrors).length > 0) {
            newErrors.sessions = sessionErrors;
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        mutate({
            courseId: course.id,
            weekName: weekName.trim(),
            sessions: sessions.map(({ date, startTime, endTime }) => ({ date, startTime, endTime })),
        });
    }

    return (
        <Modal
            title={t("title")}
            subtitle={t("subtitle")}
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 min-w-0">
                        <TextInput
                            label={t("weekNameLabel")}
                            value={weekName}
                            onChange={setWeekName}
                            error={errors.weekName}
                        />
                    </div>

                    <div className="col-span-1 min-w-0">
                        <TextInput
                            type="number"
                            label={t("sessionCountLabel")}
                            value={sessionCount}
                            onChange={handleSessionCountChange}
                        />
                    </div>
                </div>

                {previousWeek && (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-fg">{t("copyFromPreviousLabel")}</p>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleCopyFromPreviousWeek}
                                className="rounded-full border border-border bg-bg px-4 py-1.5 text-sm text-fg transition-colors cursor-pointer hover:border-accent hover:text-accent"
                            >
                                {t("previousWeekChip", { name: previousWeek.weekName })}
                            </button>
                        </div>
                    </div>
                )}

                <p className="text-sm font-medium text-fg">{t("sessionTimes")}</p>

                <div className="flex flex-col gap-2">
                    {sessions.map((session, i) => (
                        <WeekCard
                            key={session.id}
                            index={i}
                            value={session}
                            onChange={(value) => handleSessionChange(session.id, value)}
                            onDelete={() => handleDeleteSession(session.id)}
                            canDelete={sessions.length > MIN_SESSIONS}
                            errors={errors.sessions?.[session.id]}
                        />
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button
                        label={t("submit")}
                        type="submit"
                        loading={isPending}
                    />
                </div>
            </form>
        </Modal>
    )
}