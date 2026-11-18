import { enrolledCourseMemberQueries } from "@/lib/queries/courseMemberQueries";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation";
import { CourseMember as CourseMemberType } from "@/types/course-member-type";
import MemberGroup from "./MemberGroup";

export default function StudentCourseMember() {
    const { courseId } = useParams<{ courseId: string; }>();
    const t = useTranslations("studentCourseDetailPage.courseMember");

    const { data: members = [], isLoading, error } = useQuery(enrolledCourseMemberQueries.list(courseId));

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />;
    }
 
    if (error) {
        return (
            <div className="rounded-2xl border border-error/40 bg-error-bg px-6 py-10 text-center text-sm text-error">
                {error.message}
            </div>
        );
    }

    const staff = members.filter((m) => m.role !== "STUDENT");
    const self = members.filter((m) => m.role === "STUDENT");

    const renderRole = (member: CourseMemberType) => {
        return (
            <p className="text-sm text-muted">{t(`role.${member.role}`)}</p>
        )
    };

    return (
        <div className="flex flex-col gap-4">
            <MemberGroup 
                title={t("staffTitle")} 
                members={staff} 
                renderRole={renderRole}
            />

            <MemberGroup
                title={t("youTitle")} 
                members={self} 
                renderRole={renderRole}
            />
        </div>
    )
}