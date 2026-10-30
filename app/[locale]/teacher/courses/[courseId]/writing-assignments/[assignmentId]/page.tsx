"use client";

import WritingWorkspace from "@/components/assignment/WritingWorkspace";
import { useTeacherCourse } from "@/contexts/teacher-course-context";
import { notFound, useParams } from "next/navigation";

export default function TeacherWritingAssignmentPage() {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const course = useTeacherCourse();

    const assignment = course.weekSections
        .flatMap((ws) => ws.writingAssignments ?? [])
        .find((a) => a.id === assignmentId);

    if (!assignment) {
        notFound();
    }

    return (
        <WritingWorkspace
            mode="teacher"
            assignment={assignment}
        />
    );
}