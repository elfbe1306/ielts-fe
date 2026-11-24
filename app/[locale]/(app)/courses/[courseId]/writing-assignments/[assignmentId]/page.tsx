"use client";

import { useParams } from "next/navigation";

export default function WritingAssignmentPage() {
    const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();

    return (
        <div>

        </div>
    );
}