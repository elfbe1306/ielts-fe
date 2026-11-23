import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "../Button";
import PlusIcon from "../icons/PlusIcon";
import WeekSectionCard from "./WeekSectionCard";
import CreateWeekSectionModal from "../modals/CreateWeekSectionModal";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { weekSectionQueries } from "@/lib/queries/weekSectionQueries";

export default function WeekSection() {
    const { courseId } = useParams<{ courseId: string; }>();
    const t = useTranslations("courseDetail.weekSection");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const { data: weekSections = [], isLoading } = useQuery(weekSectionQueries.list(courseId));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Button
                    variant="primary"
                    label={t("createButton")}
                    icon={<PlusIcon className="text-white" width={20} height={20}/>}
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={isLoading}
                />
            </div>

            {isLoading ? (
                <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
            ) : weekSections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
                    {t("empty")}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {weekSections.map((weekSection) => (
                        <WeekSectionCard
                            key={weekSection.id}
                            courseId={courseId}
                            weekSection={weekSection}
                        />
                    ))}
                </div>
            )}

            {isCreateModalOpen && (
                <CreateWeekSectionModal
                    courseId={courseId}
                    weekSections={weekSections}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
}