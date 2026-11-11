import { formatDayMonth, formatTime, isOverdue } from "@/lib/utils";
import { WritingAssignment } from "@/types/writing-assignment-type";
import { CourseMember } from "@/types/course-type";
import { useAuth } from "@/contexts/auth-context";
import type { Editor } from "@tiptap/react";
import { useLocale, useTranslations } from "next-intl";
import { Empty, Segmented, Select, Splitter, Switch, Tabs } from "antd";
import { useCallback, useState } from "react";
import * as Y from "yjs";
import Button from "../Button";
import FileEditIcon from "../icons/FileEditIcon";
import WritingQuestionPanel from "./WritingQuestionPanel";
import WritingEditor from "./WritingEditor";
import MemberSwitcher from "./MemberSwitcher";
import CorrectionPanel from "./CorrectionPanel";
import AiAssistMenu from "./AiAssistMenu";
import AttemptContent, { AttemptView } from "./AttemptContent";
import { GenerateCorrectionsRequest, GenerateGradeRequest, ResponseLanguage } from "@/types/writing-correction-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { writingAiApi } from "@/lib/api/writingAiApi";
import { useAppMessage } from "@/contexts/message-context";
import { applyAiCorrections, buildTextIndex, countPendingCorrections } from "@/lib/ai-correction";
import { CreateWritingAttemptRequest, GradeWritingAttemptRequest, WritingGrade } from "@/types/writing-attempt-type";
import { writingAttemptApi } from "@/lib/api/writingAttemptApi";
import PencilAiIcon from "../icons/PencilAiIcon";
import AttemptOption from "./AttemptOption";
import GradingPanel from "./GradingPanel";

type WorkspaceMode = "teacher" | "student";

type WorkspaceTab = "draft" | "attempts";

type PanelSize = number | string;

type AttemptSideTab = "corrections" | "grading";

type AiGrade = {
    attemptId: string;
    grade: WritingGrade;
};

const SIZES_TWO_PANELS: PanelSize[] = ["50%", "50%"];
const SIZES_THREE_PANELS: PanelSize[] = ["25%", "50%", "25%"];

const ATTEMPT_SIZES_TWO_PANELS: PanelSize[] = ["25%", "75%"];
const ATTEMPT_SIZES_THREE_PANELS: PanelSize[] = ["25%", "50%", "25%"];

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
    const queryClient = useQueryClient();
    const locale = useLocale();

    const language: ResponseLanguage = locale === "vi" ? "VI" : "EN";

    const isTeacher = mode === "teacher";

    const [activeTab, setActiveTab] = useState<WorkspaceTab>("draft");
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
    const [showAttemptCorrectionPanel, setShowAttemptCorrectionPanel] = useState<boolean>(false);
    const [attemptSizes, setAttemptSizes] = useState<PanelSize[]>(ATTEMPT_SIZES_TWO_PANELS);
    const [attemptEditor, setAttemptEditor] = useState<Editor | null>(null);
    const [attemptEditorKey, setAttemptEditorKey] = useState<number>(0);
    const [attemptSideTab, setAttemptSideTab] = useState<AttemptSideTab>("corrections");
    const [attemptView, setAttemptView] = useState<AttemptView>("graded");
    const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
    const [isCorrection, setIsCorrection] = useState<boolean>(false);
    const [showCorrectionPanel, setShowCorrectionPanel] = useState<boolean>(false);
    const [sizes, setSizes] = useState<PanelSize[]>(SIZES_TWO_PANELS);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [editorKey, setEditorKey] = useState<number>(0);
    const [aiGrade, setAiGrade] = useState<AiGrade | null>(null);
    const [aiGradeKey, setAiGradeKey] = useState<number>(0);

    const ownerId = selectedOwnerId ?? user?.id ?? null;
    const documentName = ownerId ? `writing:${assignment.id}:${ownerId}` : null;

    const attemptOwnerId = isTeacher ? ownerId : user?.id ?? null;

    const { data: attempts = [], isLoading: isAttemptsLoading } = useQuery({
        queryKey: ["writing-attempts", assignment.id, attemptOwnerId],
        queryFn: () => writingAttemptApi.listWritingAttempts(assignment.id, attemptOwnerId!),
        enabled: attemptOwnerId !== null && activeTab === "attempts",
    });

    const currentAttemptId = selectedAttemptId ?? attempts[0]?.id ?? null;

    const getAttemptIndex = (attemptId: string) => attempts.length - attempts.findIndex((attempt) => attempt.id === attemptId);
    const findAttempt = (attemptId: string) => attempts.find((attempt) => attempt.id === attemptId);
    const currentAttempt = currentAttemptId ? findAttempt(currentAttemptId) ?? null : null;

    const handleChangeOwner = (userId: string) => {
        setSelectedOwnerId(userId);
        setSelectedAttemptId(null);
    };

    const handleSelectAttempt = (attemptId: string) => {
        setSelectedAttemptId(attemptId);
    };

    const handleEditorChange = useCallback((editor: Editor | null) => {
        setEditor(editor);
        setEditorKey((key) => key + 1);
    }, []);

    const handleAttemptEditorChange = useCallback((editor: Editor | null) => {
        setAttemptEditor(editor);
        setAttemptEditorKey((key) => key + 1);
    }, []);

    const { mutate: gradeAttempt, isPending: isGrading } = useMutation({
        mutationFn: ({ attemptId, data } : { attemptId: string, data: GradeWritingAttemptRequest }) => 
            writingAttemptApi.gradeWritingAttempt(attemptId, data),
        onSuccess: () => {
            message.success(t("attempts.gradeSuccess"));
            setAiGrade(null);
            queryClient.invalidateQueries({ queryKey: ["writing-attempts", assignment.id] });
        },
        onError: (error) => {
            message.error(error.message);
        }    
    });

    const handleFinishGrading = (grade: WritingGrade) => {
        if (!currentAttemptId || isGrading) return;

        gradeAttempt({ attemptId: currentAttemptId, data: { grade } });
    };

    const { mutate: generateGrade, isPending: isAiGrading } = useMutation({
        mutationFn: (data: GenerateGradeRequest) => writingAiApi.generateGrade(data),
        onSuccess: (data) => {
            if (!attemptEditor || attemptEditor.isDestroyed) return;

            const { applied, skipped } = applyAiCorrections(attemptEditor, data.corrections);

            message.success(t("attempts.aiApplied", { count: applied }));
            if (skipped > 0) {
                message.warning(t("attempts.aiSkipped", { count: skipped }));
            }
        
            if (currentAttemptId) {
                setAiGrade({ attemptId: currentAttemptId, grade: data.grade });
                setAiGradeKey((key) => key + 1);
            }

            handleToggleAttemptCorrectionPanel(true);
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleAiGrade = () => {
        if (!attemptEditor || attemptEditor.isDestroyed || isAiGrading) return;

        const essay = buildTextIndex(attemptEditor.state.doc).text;
        if (!essay.trim()) {
            message.warning(t("errors.aiEmptyEssay"));
            return;
        }

        const correctionCount = countPendingCorrections(attemptEditor.state.doc);
        if (correctionCount > 0) {
            message.warning(t("errors.aiGradeHasCorrections", { count: correctionCount }));
            return;
        }

        generateGrade({
            writingQuestionId: assignment.writingQuestion.id,
            essay,
            language
        })
    };

    const handleToggleAttemptCorrectionPanel = (checked: boolean) => {
        setShowAttemptCorrectionPanel(checked);
        setAttemptSizes(checked ? ATTEMPT_SIZES_THREE_PANELS : ATTEMPT_SIZES_TWO_PANELS);
    };

    const handleToggleCorrectionPanel = (checked: boolean) => {
        setShowCorrectionPanel(checked);
        setSizes(checked ? SIZES_THREE_PANELS : SIZES_TWO_PANELS);
    };

    const { mutate: generateCorrections, isPending: isGenerating } = useMutation({
        mutationFn: (data: GenerateCorrectionsRequest) => writingAiApi.generateCorrections(data),
        onSuccess: (data) => {
            if (!editor || editor.isDestroyed) return;

            const { applied, skipped } = applyAiCorrections(editor, data.corrections);

            message.success(t("drafts.aiApplied", { count: applied }));
            if (skipped > 0) {
                message.warning(t("drafts.aiSkipped", { count: skipped }));
            } else {
                handleToggleCorrectionPanel(true);
            }
        },
        onError: (error) => {
            message.error(error.message)
        }
    })

    const handleRunAi = () => {
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
            queryClient.invalidateQueries({ queryKey: ["writing-attempts", assignment.id] });
            queryClient.invalidateQueries({ queryKey: ["writing-attempt"] });
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

    const showMemberSwitcher = !membersLoading && (activeTab === "draft" || isTeacher);

    const currentAiGrade = currentAttempt && aiGrade?.attemptId === currentAttempt.id ? aiGrade.grade : null;

    const isOwnAttempts = attemptOwnerId === user?.id;
    const hasNoAttempts = !isAttemptsLoading && attempts.length === 0;

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
                                <p className="whitespace-nowrap text-muted">{t("drafts.correctionMode")}</p>
                                <Switch
                                    checked={isCorrection}
                                    onChange={setIsCorrection}
                                    checkedChildren={t("drafts.on")}
                                    unCheckedChildren={t("drafts.off")}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-1.5">
                            <p className="whitespace-nowrap text-muted">{t("drafts.correctionPanel")}</p>
                            <Switch
                                checked={showCorrectionPanel}
                                onChange={handleToggleCorrectionPanel}
                                checkedChildren={t("drafts.on")}
                                unCheckedChildren={t("drafts.off")}
                            />
                        </div>

                        {(!isEditorReadOnly || canSubmit) && (
                            <div className="ml-auto flex items-center gap-2">
                                {!isEditorReadOnly && (
                                    <AiAssistMenu
                                        onFix={handleRunAi}
                                        isLoading={isGenerating}
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
                        )}
                    </div>

                    {user && documentName && (
                        <WritingEditor
                            key={documentName}
                            documentName={documentName}
                            currentUser={{ id: user.id, name: user.fullName }}
                            readOnly={isEditorReadOnly}
                            isCorrection={isTeacher && isCorrection}
                            onEditorChange={handleEditorChange}
                        />
                    )}
                </div>
            </Splitter.Panel>

            {showCorrectionPanel && (
                <Splitter.Panel size={sizes[2]} min="20%" max="40%">
                    <div className="relative h-full">
                        <div className="absolute inset-0 flex flex-col p-6">
                            <CorrectionPanel
                                key={editorKey}
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
        <Splitter className="rounded-2xl border border-border bg-bg" onResize={setAttemptSizes}>
            <Splitter.Panel size={attemptSizes[0]} min="20%" max="50%">
                <div className="p-6">
                    <WritingQuestionPanel question={assignment.writingQuestion} note={assignment.description} />
                </div>
            </Splitter.Panel>

            <Splitter.Panel size={attemptSizes[1]} className="flex flex-col" min="30%">
                {hasNoAttempts ? (
                    <div className="flex flex-1 flex-col items-center gap-4 px-6 py-24 text-center">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-fg">{t("attempts.empty")}</span>
                                    {isOwnAttempts && <span className="text-sm text-muted">{t("attempts.emptyHint")}</span>}
                                </div>
                            }
                        />

                        {isOwnAttempts && (
                            <Button
                                size="sm"
                                type="button"
                                variant="secondary"
                                label={t("attempts.goToDraft")}
                                onClick={() => setActiveTab("draft")}
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                className="w-45"
                                placeholder={t("attempts.title")}
                                value={currentAttemptId}
                                onChange={handleSelectAttempt}
                                disabled={isAiGrading}
                                popupMatchSelectWidth={280}
                                options={attempts.map((attempt) => ({ value: attempt.id }))}
                                labelRender={({ value }) => {
                                    const attempt = findAttempt(value as string);
                                    if (!attempt) return null;
 
                                    return (
                                        <span className="flex items-center justify-between gap-2">
                                            <span>{t("attempts.label", { index: getAttemptIndex(attempt.id) })}</span>
                                            {attempt.grade && (
                                                <span className="font-bold text-accent">{attempt.grade.overall.toFixed(1)}</span>
                                            )}
                                        </span>
                                    );
                                }}
                                optionRender={(option) => {
                                    const attempt = findAttempt(option.value as string);
                                    if (!attempt) return null;
                                    return <AttemptOption attempt={attempt} index={getAttemptIndex(attempt.id)} />;
                                }}
                            />

                            <Segmented<AttemptView>
                                value={attemptView}
                                onChange={setAttemptView}
                                disabled={isAiGrading}
                                options={[
                                    { value: "original", label: t("attempts.views.original") },
                                    { value: "graded", label: t("attempts.views.graded") },
                                ]}
                            />

                            <div className="flex items-center gap-1.5">
                                <p className="whitespace-nowrap text-muted">{t("attempts.correctionPanel")}</p>
                                <Switch
                                    checked={showAttemptCorrectionPanel}
                                    onChange={handleToggleAttemptCorrectionPanel}
                                    checkedChildren={t("attempts.on")}
                                    unCheckedChildren={t("attempts.off")}
                                />
                            </div>

                            {isTeacher && currentAttemptId && (
                                <Button
                                    label={t("attempts.aiGrade")}
                                    type="button"
                                    variant="tertiary"
                                    size="sm"
                                    icon={<PencilAiIcon width={16} height={16} />}
                                    onClick={handleAiGrade}
                                    disabled={attemptView !== "graded"}
                                    loading={isAiGrading}
                                />
                            )}
                        </div>

                        <AttemptContent
                            attemptId={currentAttemptId}
                            view={attemptView}
                            editable={isTeacher}
                            onEditorChange={handleAttemptEditorChange}
                        />
                    </div>
                )}
            </Splitter.Panel>

            {showAttemptCorrectionPanel && (
                <Splitter.Panel size={attemptSizes[2]} min="20%" max="40%">
                    <div className="relative h-full">
                        <div className="absolute inset-0 flex flex-col gap-4 p-6">
                            <Segmented<AttemptSideTab>
                                block
                                value={attemptSideTab}
                                onChange={setAttemptSideTab}
                                options={[
                                    { value: "corrections", label: t("attempts.sideTabs.corrections") },
                                    { value: "grading", label: t("attempts.sideTabs.grading") },
                                ]}
                            />

                            <div className="flex min-h-0 flex-1 flex-col">
                                {attemptSideTab === "corrections" ? (
                                    <CorrectionPanel
                                        key={attemptEditorKey}
                                        editor={attemptEditor}
                                        readOnly={!isTeacher}
                                        canEdit={isTeacher}
                                    />
                                ) : (
                                    currentAttempt && (
                                        <GradingPanel
                                            key={`${currentAttempt.id}-${aiGradeKey}`}
                                            initialGrade={currentAiGrade ?? currentAttempt.grade}
                                            readonly={!isTeacher}
                                            submitting={isGrading}
                                            onSubmit={handleFinishGrading}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </Splitter.Panel>
            )}
        </Splitter>
    );

    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-sm">
                <span className="font-medium text-muted">{t("header.dueLabel")}: </span>
                <span className={overdue ? "text-error" : "text-fg"}>
                    {formatTime(assignment.dueTime)} - {formatDayMonth(assignment.dueDate)}
                </span>
                {overdue && <span className="ml-2 font-medium text-error">{t("header.overdue")}</span>}
            </p>

            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as WorkspaceTab)}
                tabBarExtraContent={
                    showMemberSwitcher && (
                        <MemberSwitcher
                            members={members}
                            value={ownerId}
                            onChange={handleChangeOwner}
                            currentUserId={user?.id ?? null}
                            disabled={isGenerating || isAiGrading}
                        />
                    )
                }
                items={[
                    { key: "draft", label: t("tabs.draft"), children: draftTab },
                    { key: "attempts", label: t("tabs.attempts"), children: attemptTab },
                ]}
            />
        </div>
    );
}