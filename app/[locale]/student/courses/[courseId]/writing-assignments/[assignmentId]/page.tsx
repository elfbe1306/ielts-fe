"use client";

import WritingWorkspace from "@/components/assignment/WritingWorkspace";
import { useStudentCourse } from "@/contexts/student-course-context";
import { courseApi } from "@/lib/api/courseApi";
import { useQuery } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";

export default function StudentWritingAssignmentPage() {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const course = useStudentCourse();

    const { data: members = [], isLoading } = useQuery({
        queryKey: ["course", course.id, "members"],
        queryFn: () => courseApi.listEnrolledMembers(course.id),
    });

    const assignment = course.weekSections
        .flatMap((ws) => ws.writingAssignments ?? [])
        .find((a) => a.id === assignmentId);

    if (!assignment) {
        notFound();
    }

    return (
        <WritingWorkspace
            mode="student"
            assignment={assignment}
            members={members}
            membersLoading={isLoading}
        />
    );
}