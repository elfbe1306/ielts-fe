"use client";

import CourseHeader from "@/components/course/CourseHeader";
import StudentCourseHeader from "@/components/course/StudentCourseHeader";
import WeekSection from "@/components/course/WeekSection";
import StudentWeekSection from "@/components/course/StudentWeekSection";
import { useAuth } from "@/hooks/useAuth";
import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import CourseMember from "@/components/course/CourseMember";
import StudentCourseMember from "@/components/course/StudentCourseMember";

export default function CourseDetailPage() {
    const t = useTranslations("courseDetail");
    const { user } = useAuth();

    if (!user) return null;

    const isTeacher = user.role === "TEACHER";

    return (
        <div className="flex flex-col gap-6">
            {isTeacher ? <CourseHeader /> : <StudentCourseHeader />}

            <Tabs
                defaultActiveKey="weeks"
                items={[
                    { key: "weeks", label: t("tabs.weeks"), children: isTeacher ? <WeekSection /> : <StudentWeekSection /> },
                    { key: "members", label: t("tabs.members"), children: isTeacher ? <CourseMember /> : <StudentCourseMember /> },
                ]}
            />
        </div>
    )
}