import { formatDayMonth, formatTime, parseLocalDate, todayIso } from "@/lib/utils";
import { WeekSection } from "@/types/week-section-type";
import { useLocale, useTranslations } from "next-intl";
import StudentAssignmentList from "./StudentAssignmentList";

type StudentWeekSectionCardProps = {
    courseId: string;
    weekSection: WeekSection;
}

export default function StudentWeekSectionCard({ courseId, weekSection } : StudentWeekSectionCardProps) {
    const t = useTranslations("studentCourseDetailPage.weekSectionCard");
    const locale = useLocale();

    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const today = todayIso();

    const writingAssignments = weekSection.writingAssignments ?? [];

    return (
        <div className="flex flex-col gap-3 rounded-xl bg-bg border border-border p-4">
            <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-fg">{weekSection.weekName}</p>
                <p className="text-sm text-muted">
                    {t("sessionCount", { count: weekSection.sessions.length })}
                </p>
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
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                    {t("assignments.title")}
                </p>

                {writingAssignments.length > 0 ? (
                    <StudentAssignmentList
                        courseId={courseId}
                        writingAssignments={writingAssignments} 
                    />
                ) : (
                    <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted">
                        {t("assignments.empty")}
                    </p>
                )}
            </div>
        </div>
    )
}