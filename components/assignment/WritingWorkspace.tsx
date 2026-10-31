import { formatDayMonth, formatTime, isOverdue } from "@/lib/utils";
import { WritingAssignment } from "@/types/writing-assignment-type";
import { useTranslations } from "next-intl";
import Button from "../Button";
import FileEditIcon from "../icons/FileEditIcon";
import { Splitter, Switch } from "antd";
import { useState } from "react";
import WritingQuestionPanel from "./WritingQuestionPanel";
import WritingEditor from "./WritingEditor";
import MemberSwitcher from "./MemberSwitcher";
import { CourseMember } from "@/types/course-type";
import { useAuth } from "@/contexts/auth-context";

type WorkspaceMode = "teacher" | "student";

type PanelSize = number | string;

const SIZES_TWO_PANELS: PanelSize[] = ["50%", "50%"];
const SIZES_THREE_PANELS: PanelSize[] = ["25%", "50%", "25%"];

type WritingWorkspaceProps = {
    mode: WorkspaceMode;
    assignment: WritingAssignment;
    members: CourseMember[];
    membersLoading: boolean;
}

export default function WritingWorkspace({ mode, assignment, members, membersLoading = false } : WritingWorkspaceProps) {
    const t = useTranslations("writingWorkspace");
    const { user } = useAuth();

    const isTeacher = mode === "teacher";

    const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
    const [isCorrection, setIsCorrection] = useState<boolean>(false);
    const [showCorrectionPanel, setShowCorrectionPanel] = useState<boolean>(false);
    const [sizes, setSizes] = useState<PanelSize[]>(SIZES_TWO_PANELS);

    const handleToggleCorrectionPanel = (checked: boolean) => {
        setShowCorrectionPanel(checked);
        setSizes(checked ? SIZES_THREE_PANELS : SIZES_TWO_PANELS);
    };

    const overdue = isOverdue(assignment.dueDate, assignment.dueTime);

    const ownerId = selectedOwnerId ?? user?.id ?? null;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <p className="text-sm">
                    <span className="font-medium text-muted">{t("dueLabel")}: </span>
                    <span className={overdue ? "text-error" : "text-fg"}>
                        {formatTime(assignment.dueTime)} - {formatDayMonth(assignment.dueDate)}
                    </span>
                    {overdue && (
                        <span className="ml-2 font-medium text-error">{t("overdue")}</span>
                    )}
                </p>

                <div className="flex items-center gap-3">
                    {!membersLoading && (
                        <MemberSwitcher 
                            members={members} 
                            value={ownerId}
                            onChange={setSelectedOwnerId}
                            currentUserId={user?.id ?? null}
                        />
                    )}

                    <Button
                        size="sm"
                        type="button"
                        label={t("submit")}
                        icon={<FileEditIcon className="text-white" width={16} height={16}/>}
                        onClick={() => {}}
                    />
                </div>
            </div>

            <Splitter className="rounded-2xl border border-border bg-bg" onResize={setSizes}>
                <Splitter.Panel size={sizes[0]} min="20%" max={showCorrectionPanel ? "50%" : "70%"}>
                    <div className="p-6">
                        <WritingQuestionPanel question={assignment.writingQuestion} note={assignment.description}/>
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
                                <p className="whitespace-nowrap text-muted">{t("correctionPanel")}</p>
                                <Switch
                                    checked={showCorrectionPanel}
                                    onChange={handleToggleCorrectionPanel}
                                    checkedChildren={t("correctionOn")}
                                    unCheckedChildren={t("correctionOff")}
                                />
                            </div>
                        </div>

                        <WritingEditor/>
                    </div>
                </Splitter.Panel>

                {showCorrectionPanel && (
                    <Splitter.Panel size={sizes[2]} min="20%" max="40%">
                        <div className="relative h-full">
                            <div className="absolute inset-0 flex flex-col p-6">

                            </div>
                        </div>
                    </Splitter.Panel>
                )}
            </Splitter>
        </div>
    )
}