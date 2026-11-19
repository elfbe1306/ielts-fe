"use client";

import WritingWorkspace from "@/components/assignment/WritingWorkspace";
import { courseMemberQueries } from "@/lib/queries/courseMemberQueries";
import { writingAssignmentQueries } from "@/lib/queries/writingAssignmentQueries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function TeacherWritingAssignmentPage() {
    const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();

    const { data: assignment, isLoading, error } = useQuery(writingAssignmentQueries.detail(courseId, assignmentId));
    const { data: members = [], isLoading: membersLoading } = useQuery(courseMemberQueries.list(courseId));

    if (isLoading) {
        return <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />;
    }

    if (error || !assignment) {
        return (
            <div className="rounded-2xl border border-error/40 bg-error-bg px-6 py-10 text-center text-sm text-error">
                {error?.message}
            </div>
        );
    }

    return (
        <WritingWorkspace
            mode="teacher"
            courseId={courseId}
            assignment={assignment}
            members={members}
            membersLoading={membersLoading}
        />
    );
}