import { writingAttemptApi } from "@/lib/api/writingAttemptApi";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import AttemptViewer from "./AttemptViewer";
import type { Editor } from "@tiptap/react";

export type AttemptView = "original" | "graded";

type AttemptContentProps = {
    attemptId: string | null;
    view: AttemptView;
    editable?: boolean;
    onEditorChange?: (editor: Editor | null) => void;
};

export default function AttemptContent({ attemptId, view, editable = false, onEditorChange }: AttemptContentProps) {
    const t = useTranslations("writingWorkspace.attempts");

    const { data: attempt, isLoading } = useQuery({
        queryKey: ["writing-attempt", attemptId],
        queryFn: () => writingAttemptApi.getWritingAttempt(attemptId!),
        enabled: attemptId !== null,
    });

    if (isLoading) {
        return <div className="flex min-h-180 flex-1 animate-pulse border border-border bg-surface" />;
    }

    if (!attempt) return null;

    const canEdit = editable && view === "graded";

    const content = view === "graded"
        ? attempt.gradedContent ?? (canEdit ? attempt.originalContent : null)
        : attempt.originalContent;

    if (!content) {
        return (
            <div className="flex min-h-180 flex-1 items-center justify-center border border-border text-muted">
                {t("notGraded")}
            </div>
        );
    }

    return (
        <AttemptViewer
            key={`${attempt.id}-${view}-${attempt.submittedAt}`}
            content={content}
            editable={canEdit}
            onEditorChange={onEditorChange}
        />
    );
}