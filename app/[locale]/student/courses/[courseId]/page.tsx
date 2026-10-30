"use client";

import StudentCourseHeader from "@/components/course/StudentCourseHeader";
import StudentWeekSection from "@/components/course/StudentWeekSection";

export default function StudentCourseDetailPage() {
    return (
        <div className="flex flex-col gap-6">
            <StudentCourseHeader />
            <StudentWeekSection />
        </div>
    );
}