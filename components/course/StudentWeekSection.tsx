import { useTranslations } from "next-intl";
import StudentWeekSectionCard from "./StudentWeekSectionCard";
import { useParams } from "next/navigation";
import { enrolledWeekSectionQueries } from "@/lib/queries/weekSectionQueries";
import { useQuery } from "@tanstack/react-query";

export default function StudentWeekSection() {
    const { courseId } = useParams<{ courseId: string; }>();
    const t = useTranslations("courseDetail.weekSection");

    const { data: weekSections = [], isLoading } = useQuery(enrolledWeekSectionQueries.list(courseId));

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />;
    }

    if (weekSections.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
                {t("empty")}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {weekSections.map((weekSection) => (
                <StudentWeekSectionCard
                    key={weekSection.id}
                    courseId={courseId}
                    weekSection={weekSection}
                />
            ))}
        </div>
    );
}