"use client";

import CourseHeader from "@/components/course/CourseHeader";
import WeekSection from "@/components/course/WeekSection";

export default function TeacherCourseDetailPage() {
    return (
        <div className="flex flex-col gap-6">
            <CourseHeader />
            <WeekSection />
        </div>
    );
}