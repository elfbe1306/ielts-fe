import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "../Button";
import { Course } from "@/types/course-type";
import CheckBoxIcon from "../icons/CheckBoxIcon";
import PlusIcon from "../icons/PlusIcon";
import WeekSectionCard from "./WeekSectionCard";
import CreateWeekSectionModal from "../modals/CreateWeekSectionModal";

type WeekSectionProps = {
    course: Course;
};

export default function WeekSection({ course }: WeekSectionProps) {
    const t = useTranslations("teacherCourseDetailPage.weekSection");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-fg">{t("title")}</p>
                <div className="flex gap-2">
                    <Button
                        variant="tertiary"
                        label={t("gradeButton")}
                        icon={<CheckBoxIcon className="text-accent" width={20} height={20}/>}
                    />

                    <Button
                        variant="primary"
                        label={t("createButton")}
                        icon={<PlusIcon className="text-white" width={20} height={20}/>}
                        onClick={() => setIsCreateModalOpen(true)}
                    />
                </div>
            </div>

            {course.weekSections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
                    {t("empty")}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {course.weekSections.map((weekSection) => (
                        <WeekSectionCard
                            key={weekSection.id}
                            courseId={course.id}
                            weekSection={weekSection}
                        />
                    ))}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateWeekSectionModal
                    course={course}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
}