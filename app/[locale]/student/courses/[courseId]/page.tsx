"use client";


import StudentCourseHeader from "@/components/course/StudentCourseHeader";
import StudentWeekSection from "@/components/course/StudentWeekSection";
import { studentCourseApi } from "@/lib/api/student/studentCourseApi";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function StudentCourseDetailPage() {
    const { courseId } = useParams<{ courseId: string }>();

    const { data: course, isLoading, error } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => studentCourseApi.getEnrolledCourseById(courseId),
    });

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

    if (!course) return null;
    
    return (
        <div className="flex flex-col gap-6">
            <StudentCourseHeader course={course} />
            <StudentWeekSection course={course} />
        </div>
    )
}