import { formatDayMonth, formatInstant, formatTime, isOverdue } from "@/lib/utils";
import { WritingAssignment } from "@/types/writing-assignment-type";
import { CourseMember } from "@/types/course-type";
import { useAuth } from "@/contexts/auth-context";
import type { Editor } from "@tiptap/react";
import { useTranslations } from "next-intl";
import { Listy, Segmented, Splitter, Switch, Tabs, Tooltip } from "antd";
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
import { CreateWritingAttemptRequest, WritingAttemptSummary, WritingScore } from "@/types/writing-attempt-type";
import { writingAttemptApi } from "@/lib/api/writingAttemptApi";

type WorkspaceMode = "teacher" | "student";

type WorkspaceTab = "draft" | "attempts";

type AttemptView = "original" | "graded";

type PanelSize = number | string;

const MOCK_ATTEMPTS: WritingAttemptSummary[] = [
    { id: "attempt-15", status: "SUBMITTED", submittedAt: "2026-11-07T21:15:00+07:00", score: null },
    { id: "attempt-14", status: "GRADED", submittedAt: "2026-11-05T19:40:00+07:00", score: { taskResponse: 7, coherenceCohesion: 6.5, lexicalResource: 7, grammaticalRange: 6.5, overall: 7 } },
    { id: "attempt-13", status: "GRADED", submittedAt: "2026-11-03T08:05:00+07:00", score: { taskResponse: 6.5, coherenceCohesion: 6.5, lexicalResource: 7, grammaticalRange: 6.5, overall: 6.5 } },
    { id: "attempt-12", status: "GRADED", submittedAt: "2026-10-31T22:30:00+07:00", score: { taskResponse: 6.5, coherenceCohesion: 6.5, lexicalResource: 6.5, grammaticalRange: 6, overall: 6.5 } },
    { id: "attempt-11", status: "GRADED", submittedAt: "2026-10-29T14:10:00+07:00", score: { taskResponse: 6.5, coherenceCohesion: 6, lexicalResource: 6.5, grammaticalRange: 6, overall: 6 } },
    { id: "attempt-10", status: "GRADED", submittedAt: "2026-10-26T20:45:00+07:00", score: { taskResponse: 6, coherenceCohesion: 6, lexicalResource: 6.5, grammaticalRange: 6, overall: 6 } },
    { id: "attempt-9", status: "GRADED", submittedAt: "2026-10-23T09:20:00+07:00", score: { taskResponse: 6, coherenceCohesion: 6, lexicalResource: 6, grammaticalRange: 6, overall: 6 } },
    { id: "attempt-8", status: "GRADED", submittedAt: "2026-10-20T18:55:00+07:00", score: { taskResponse: 6, coherenceCohesion: 5.5, lexicalResource: 6, grammaticalRange: 6, overall: 6 } },
    { id: "attempt-7", status: "GRADED", submittedAt: "2026-10-17T07:35:00+07:00", score: { taskResponse: 6, coherenceCohesion: 5.5, lexicalResource: 6, grammaticalRange: 5.5, overall: 5.5 } },
    { id: "attempt-6", status: "GRADED", submittedAt: "2026-10-14T21:00:00+07:00", score: { taskResponse: 5.5, coherenceCohesion: 5.5, lexicalResource: 6, grammaticalRange: 5.5, overall: 5.5 } },
    { id: "attempt-5", status: "GRADED", submittedAt: "2026-10-11T16:25:00+07:00", score: { taskResponse: 5.5, coherenceCohesion: 5.5, lexicalResource: 5.5, grammaticalRange: 5.5, overall: 5.5 } },
    { id: "attempt-4", status: "GRADED", submittedAt: "2026-10-08T10:50:00+07:00", score: { taskResponse: 5.5, coherenceCohesion: 5, lexicalResource: 5.5, grammaticalRange: 5.5, overall: 5.5 } },
    { id: "attempt-3", status: "GRADED", submittedAt: "2026-10-05T23:10:00+07:00", score: { taskResponse: 5.5, coherenceCohesion: 5, lexicalResource: 5.5, grammaticalRange: 5, overall: 5 } },
    { id: "attempt-2", status: "GRADED", submittedAt: "2026-10-02T13:40:00+07:00", score: { taskResponse: 5, coherenceCohesion: 5, lexicalResource: 5.5, grammaticalRange: 5, overall: 5 } },
    { id: "attempt-1", status: "GRADED", submittedAt: "2026-09-29T19:05:00+07:00", score: { taskResponse: 5, coherenceCohesion: 5, lexicalResource: 5, grammaticalRange: 4.5, overall: 5 } },
];

const SCORE_CRITERIA: (keyof Omit<WritingScore, "overall">)[] = ["taskResponse", "coherenceCohesion", "lexicalResource", "grammaticalRange"];

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

    const [activeTab, setActiveTab] = useState<WorkspaceTab>("draft");
    const [selectedAttemptId, setSelectedAttemptId] = useState<string>(MOCK_ATTEMPTS[0].id);
    const [attemptView, setAttemptView] = useState<AttemptView>("graded");
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

            message.success(t("draft.aiApplied", { count: applied }));
            if (skipped > 0) {
                message.warning(t("draft.aiSkipped", { count: skipped }));
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
            message.success(t("header.submitSuccess"));
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

    const draftTab = (
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
                                <p className="whitespace-nowrap text-muted">{t("draft.correctionMode")}</p>
                                <Switch
                                    checked={isCorrection}
                                    onChange={setIsCorrection}
                                    checkedChildren={t("draft.on")}
                                    unCheckedChildren={t("draft.off")}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-1.5">
                            <p className="whitespace-nowrap text-muted">{t("draft.correctionPanel")}</p>
                            <Switch
                                checked={showCorrectionPanel}
                                onChange={handleToggleCorrectionPanel}
                                checkedChildren={t("draft.on")}
                                unCheckedChildren={t("draft.off")}
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
    );

    const attemptTab = (
        <Splitter className="rounded-2xl border border-border bg-bg">
            <Splitter.Panel defaultSize="25%" min="20%" max="50%">
                <div className="p-6">
                    <WritingQuestionPanel question={assignment.writingQuestion} note={assignment.description} />
                </div>
            </Splitter.Panel>

            <Splitter.Panel className="flex flex-col" min="30%">
                <div className="flex flex-1 p-6">
                    <div className="flex w-60 shrink-0 flex-col">
                        <p className="text-muted font-semibold">{t("attempts.title")}</p>

                        <Listy<WritingAttemptSummary>
                            items={MOCK_ATTEMPTS}
                            rowKey="id"
                            height={680}
                            styles={{ item: { padding: "4px 0", border: "none", background: "transparent" } }}
                            itemRender={(attempt) => {
                                const index =  MOCK_ATTEMPTS.length - MOCK_ATTEMPTS.indexOf(attempt);
                                const isSelected = attempt.id === selectedAttemptId;
                                const score = attempt.score;
 
                                return (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAttemptId(attempt.id)}
                                        className={`flex w-full flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors ${isSelected ? "border-accent bg-accent-bg" : "border-border bg-bg hover:border-accent/50"}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-fg">
                                                {t("attempts.label", { index })}
                                            </span>
                                            {score && (
                                                <Tooltip
                                                    placement="top"
                                                    title={
                                                        <div className="flex min-w-44 flex-col gap-1 py-0.5">
                                                            {SCORE_CRITERIA.map((criterion) => (
                                                                <div key={criterion} className="flex items-center justify-between gap-4">
                                                                    <span>{t(`attempts.score.${criterion}`)}</span>
                                                                    <span className="font-semibold">{score[criterion]}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    }
                                                >
                                                    <span className="text-lg font-bold text-accent">
                                                        {score.overall}
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted">
                                            {formatInstant(attempt.submittedAt)}
                                        </span>
                                        <span className={`text-sm font-medium ${attempt.status === "GRADED" ? "text-success" : "text-highlight"}`}>
                                            {t(`attempts.status.${attempt.status}`)}
                                        </span>
                                    </button>
                                )
                            }}
                        />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3 pl-6">
                        <Segmented<AttemptView>
                            className="self-start"
                            value={attemptView}
                            onChange={setAttemptView}
                            options={[
                                { value: "original", label: t("attempts.views.original") },
                                { value: "graded", label: t("attempts.views.graded") },
                            ]}
                        />
 
                        {/* TODO: editor không qua Hocuspocus — "original" hiện originalContent, "graded" hiện gradedContent */}
                        <div className="flex min-h-180 flex-1 border border-border" />
                    </div>
                </div>
            </Splitter.Panel>
        </Splitter>
    );

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <p className="text-sm">
                    <span className="font-medium text-muted">{t("header.dueLabel")}: </span>
                    <span className={overdue ? "text-error" : "text-fg"}>
                        {formatTime(assignment.dueTime)} - {formatDayMonth(assignment.dueDate)}
                    </span>
                    {overdue && <span className="ml-2 font-medium text-error">{t("header.overdue")}</span>}
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
                            label={t("header.submit")}
                            icon={<FileEditIcon className="text-white" width={16} height={16} />}
                            loading={isSubmitting}
                            onClick={handleSubmit}
                        />
                    )}
                </div>
            </div>
            
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as WorkspaceTab)}
                items={[
                    { key: "draft", label: t("tabs.draft"), children: draftTab },
                    { key: "attempts", label: t("tabs.attempts"), children: attemptTab },
                ]}
            />
        </div>
    );
}