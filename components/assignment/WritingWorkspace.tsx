import { formatDayMonth, formatTime, isOverdue } from "@/lib/utils";
import { WritingAssignment } from "@/types/writing-assignment-type";
import { CourseMember } from "@/types/course-type";
import { useAuth } from "@/contexts/auth-context";
import type { Editor } from "@tiptap/react";
import { useTranslations } from "next-intl";
import { Splitter, Switch } from "antd";
import { useState } from "react";
import * as Y from "yjs";
import Button from "../Button";
import FileEditIcon from "../icons/FileEditIcon";
import WritingQuestionPanel from "./WritingQuestionPanel";
import WritingEditor from "./WritingEditor";
import MemberSwitcher from "./MemberSwitcher";
import CorrectionPanel from "./CorrectionPanel";
import AiAssistMenu from "./AiAssistMenu";
import { GenerateCorrectionsRequest, ResponseLanguage } from "@/types/writing-correction-type";
import { useMutation } from "@tanstack/react-query";
import { writingAiApi } from "@/lib/api/writingAiApi";
import { useAppMessage } from "@/contexts/message-context";
import { applyAiCorrections, buildTextIndex, countPendingCorrections } from "@/lib/ai-correction";
import { CreateWritingAttemptRequest } from "@/types/writing-attempt-type";
import { writingAttemptApi } from "@/lib/api/writingAttemptApi";

type WorkspaceMode = "teacher" | "student";

type PanelSize = number | string;

const SIZES_TWO_PANELS: PanelSize[] = ["50%", "50%"];
const SIZES_THREE_PANELS: PanelSize[] = ["25%", "50%", "25%"];

type WritingWorkspaceProps = {
    mode: WorkspaceMode;
    assignment: WritingAssignment;
    members: CourseMember[];
    membersLoading?: boolean;
};

export default function WritingWorkspace({ mode, assignment, members, membersLoading = false }: WritingWorkspaceProps) {
    const t = useTranslations("writingWorkspace");
    const { user } = useAuth();
    const message = useAppMessage();

    const isTeacher = mode === "teacher";

    const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
    const [isCorrection, setIsCorrection] = useState<boolean>(false);
    const [showCorrectionPanel, setShowCorrectionPanel] = useState<boolean>(false);
    const [sizes, setSizes] = useState<PanelSize[]>(SIZES_TWO_PANELS);
    const [editor, setEditor] = useState<Editor | null>(null);

    const ownerId = selectedOwnerId ?? user?.id ?? null;
    const documentName = ownerId ? `writing:${assignment.id}:${ownerId}` : null;

    const handleToggleCorrectionPanel = (checked: boolean) => {
        setShowCorrectionPanel(checked);
        setSizes(checked ? SIZES_THREE_PANELS : SIZES_TWO_PANELS);
    };

    const { mutate: generateCorrections, isPending: isGenerating } = useMutation({
        mutationFn: (data: GenerateCorrectionsRequest) => writingAiApi.generateCorrections(data),
        onSuccess: (data) => {
            if (!editor || editor.isDestroyed) return;

            const { applied, skipped } = applyAiCorrections(editor, data.corrections);

            message.success(t("aiApplied", { count: applied }));
            if (skipped > 0) {
                message.warning(t("aiSkipped", { count: skipped }));
            } else {
                handleToggleCorrectionPanel(true);
            }
        },
        onError: (error) => {
            message.error(error.message)
        }
    })

    const handleRunAi = (language: ResponseLanguage) => {
        if (!editor || editor.isDestroyed || isGenerating) return;

        const essay = buildTextIndex(editor.state.doc).text;
        if (!essay.trim()) {
            message.warning(t("errors.aiEmptyEssay"));
            return;
        }

        const pendingCount = countPendingCorrections(editor.state.doc);
        if (pendingCount > 0) {
            message.warning(t("errors.aiPendingCorrections", { count: pendingCount }));
            return;
        }

        generateCorrections({
            writingQuestionId: assignment.writingQuestion.id,
            essay,
            language
        });
    }

    const { mutate: submitAttempt, isPending: isSubmitting } = useMutation({
        mutationFn: (data: CreateWritingAttemptRequest) => writingAttemptApi.createWritingAttempt(data),
        onSuccess: () => {
            message.success(t("submitSuccess"));
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleSubmit = () => {
        if (!editor || editor.isDestroyed || isSubmitting) return;

        if (!editor.getText().trim()) {
            message.warning(t("errors.aiEmptyEssay"));
            return;
        }

        const pendingCount = countPendingCorrections(editor.state.doc);
        if (pendingCount > 0) {
            message.warning(t("errors.aiPendingCorrections", { count: pendingCount }));
            return;
        }

        const collaboration = editor.extensionManager.extensions.find((ext) => ext.name === "collaboration");
        const ydoc = collaboration?.options.document as Y.Doc | undefined;
        if (!ydoc) return;

        submitAttempt({
            assignmentId: assignment.id,
            content: btoa(String.fromCharCode(...Y.encodeStateAsUpdate(ydoc))),
        });
    }

    const overdue = isOverdue(assignment.dueDate, assignment.dueTime);

    const isEditorReadOnly = !isTeacher && ownerId !== user?.id;
    const canSubmit = ownerId === user?.id;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <p className="text-sm">
                    <span className="font-medium text-muted">{t("dueLabel")}: </span>
                    <span className={overdue ? "text-error" : "text-fg"}>
                        {formatTime(assignment.dueTime)} - {formatDayMonth(assignment.dueDate)}
                    </span>
                    {overdue && <span className="ml-2 font-medium text-error">{t("overdue")}</span>}
                </p>

                <div className="flex items-center gap-3">
                    {!membersLoading && (
                        <MemberSwitcher
                            members={members}
                            value={ownerId}
                            onChange={setSelectedOwnerId}
                            currentUserId={user?.id ?? null}
                            disabled={isGenerating}
                        />
                    )}

                    {canSubmit && (
                        <Button
                            size="sm"
                            type="button"
                            label={t("submit")}
                            icon={<FileEditIcon className="text-white" width={16} height={16} />}
                            loading={isSubmitting}
                            onClick={handleSubmit}
                        />
                    )}
                </div>
            </div>

            <Splitter className="rounded-2xl border border-border bg-bg" onResize={setSizes}>
                <Splitter.Panel size={sizes[0]} min="20%" max={showCorrectionPanel ? "50%" : "70%"}>
                    <div className="p-6">
                        <WritingQuestionPanel question={assignment.writingQuestion} note={assignment.description} />
                    </div>
                </Splitter.Panel>

                <Splitter.Panel size={sizes[1]} className="flex flex-col" min="30%">
                    <div className="flex flex-1 flex-col gap-3 p-6">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {isTeacher && (
                                <div className="flex items-center gap-1.5">
                                    <p className="whitespace-nowrap text-muted">{t("correctionMode")}</p>
                                    <Switch
                                        checked={isCorrection}
                                        onChange={setIsCorrection}
                                        checkedChildren={t("correctionOn")}
                                        unCheckedChildren={t("correctionOff")}
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <p className="whitespace-nowrap text-muted">{t("correctionPanelToggle")}</p>
                                <Switch
                                    checked={showCorrectionPanel}
                                    onChange={handleToggleCorrectionPanel}
                                    checkedChildren={t("correctionOn")}
                                    unCheckedChildren={t("correctionOff")}
                                />
                            </div>

                            {!isEditorReadOnly && (
                                <div className="ml-auto">
                                    <AiAssistMenu
                                        onFix={(language) => handleRunAi(language)}
                                        isLoading={isGenerating}
                                    />
                                </div>
                            )}
                        </div>

                        {user && documentName && (
                            <WritingEditor
                                key={documentName}
                                documentName={documentName}
                                currentUser={{ id: user.id, name: user.fullName }}
                                readOnly={isEditorReadOnly}
                                isCorrection={isTeacher && isCorrection}
                                onEditorChange={setEditor}
                            />
                        )}
                    </div>
                </Splitter.Panel>

                {showCorrectionPanel && (
                    <Splitter.Panel size={sizes[2]} min="20%" max="40%">
                        <div className="relative h-full">
                            <div className="absolute inset-0 flex flex-col p-6">
                                <CorrectionPanel
                                    editor={editor}
                                    readOnly={isEditorReadOnly}
                                    canEdit={isTeacher}
                                />
                            </div>
                        </div>
                    </Splitter.Panel>
                )}
            </Splitter>
        </div>
    );
}