"use client";

import StudentCourseHeader from "@/components/course/StudentCourseHeader";
import StudentCourseMember from "@/components/course/StudentCourseMember";
import StudentWeekSection from "@/components/course/StudentWeekSection";
import { Tabs } from "antd";
import { useTranslations } from "next-intl";

export default function StudentCourseDetailPage() {
    const t = useTranslations("studentCourseDetailPage.tabs");

    return (
        <div className="flex flex-col gap-6">
            <StudentCourseHeader />

            <Tabs
                defaultActiveKey="weeks"
                items={[
                    { key: "weeks", label: t("weeks"), children: <StudentWeekSection /> },
                    { key: "members", label: t("members"), children: <StudentCourseMember /> },
                ]}
            />
        </div>
    );
}