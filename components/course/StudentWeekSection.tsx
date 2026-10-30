import { useTranslations } from "next-intl";
import StudentWeekSectionCard from "./StudentWeekSectionCard";
import { useStudentCourse } from "@/contexts/student-course-context";

export default function StudentWeekSection() {
    const course = useStudentCourse();
    const t = useTranslations("studentCourseDetailPage.weekSection");

    return (
        <div className="flex flex-col gap-4">
            <p className="text-xl font-bold text-fg">{t("title")}</p>

            {course.weekSections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
                    {t("empty")}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {course.weekSections.map((weekSection) => (
                        <StudentWeekSectionCard
                            key={weekSection.id}
                            courseId={course.id}
                            weekSection={weekSection}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}