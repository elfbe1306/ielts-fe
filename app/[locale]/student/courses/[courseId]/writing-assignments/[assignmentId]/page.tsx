"use client";

import WritingWorkspace from "@/components/assignment/WritingWorkspace";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function StudentWritingAssignmentPage() {
    const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();

    const { data: assignment, isLoading, error } = useQuery({
        queryKey: ["assignment", assignmentId],
        queryFn: () => {},
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

    if (!assignment) return null;

    return (
        <WritingWorkspace
            mode="student"
            assignment={assignment}
        />
    );
}