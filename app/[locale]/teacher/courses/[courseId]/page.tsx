"use client";

import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import CourseHeader from "@/components/course/CourseHeader";
import WeekSection from "@/components/course/WeekSection";
import CourseMember from "@/components/course/CourseMember";

export default function TeacherCourseDetailPage() {
    const t = useTranslations("teacherCourseDetailPage.tabs");

    return (
        <div className="flex flex-col gap-6">
            <CourseHeader />

            <Tabs
                defaultActiveKey="weeks"
                items={[
                    { key: "weeks", label: t("weeks"), children: <WeekSection /> },
                    { key: "members", label: t("members"), children: <CourseMember /> },
                ]}
            />
        </div>
    );
}