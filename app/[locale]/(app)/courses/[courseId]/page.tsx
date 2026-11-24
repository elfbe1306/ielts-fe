"use client";

import CourseHeader from "@/components/course/CourseHeader";
import StudentCourseHeader from "@/components/course/StudentCourseHeader";
import WeekSection from "@/components/course/WeekSection";
import StudentWeekSection from "@/components/course/StudentWeekSection";
import CourseMember from "@/components/course/CourseMember";
import StudentCourseMember from "@/components/course/StudentCourseMember";
import { isNotFoundError } from "@/lib/api/error";
import { myMembershipQueries } from "@/lib/queries/courseMemberQueries";
import { useQuery } from "@tanstack/react-query";
import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import { notFound, useParams } from "next/navigation";

export default function CourseDetailPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const t = useTranslations("courseDetail");

    const { data: membership, isLoading, error } = useQuery(myMembershipQueries.detail(courseId));

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />;
    }

    if (error) {
        if (isNotFoundError(error)) {
            notFound();
        }

        return (
            <div className="rounded-2xl border border-error/40 bg-error-bg px-6 py-10 text-center text-sm text-error">
                {error.message}
            </div>
        );
    }

    if (!membership) return null;

    const isTeacher = membership.role === "TEACHER";
    const isStaff = isTeacher || membership.role === "ASSISTANT";

    return (
        <div className="flex flex-col gap-6">
            {isTeacher ? <CourseHeader /> : <StudentCourseHeader />}

            <Tabs
                defaultActiveKey="weeks"
                items={[
                    { key: "weeks", label: t("tabs.weeks"), children: isStaff ? <WeekSection /> : <StudentWeekSection /> },
                    { key: "members", label: t("tabs.members"), children: isStaff ? <CourseMember canManage={isTeacher} /> : <StudentCourseMember /> },
                ]}
            />
        </div>
    );
}