import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { Image, Tag } from "antd";
import Button from "../Button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppMessage } from "@/contexts/message-context";
import { formatTime } from "@/lib/utils";
import { UpdateWritingAssignmentRequest, WritingAssignment } from "@/types/writing-assignment-type";
import { teacherWritingAssignmentApi } from "@/lib/api/teacher/teacherWritingAssignmentApi";
import { DIFFICULTY_COLORS, TASK_TYPE_COLORS } from "@/types/writing-question-type";
import DateInput from "../form-input/DateInput";
import TimeInput from "../form-input/TimeInput";
import TextInput from "../form-input/TextInput";

const THUMB_SIZE = 64;

type UpdateWritingAssignmentModalProps = {
    courseId: string;
    isOpen: boolean;
    onClose: () => void;
    assignment: WritingAssignment;
}

type Errors = {
    dueDateError?: string;
    dueTimeError?: string;
}

export default function UpdateWritingAssignmentModal({ courseId, assignment, isOpen, onClose } : UpdateWritingAssignmentModalProps) {
    const t = useTranslations("teacherCourseDetailPage.updateWritingAssignmentModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const question = assignment.writingQuestion;
    const initialDueTime = formatTime(assignment.dueTime);
    const initialDescription = (assignment.description ?? "").trim();

    const [dueDate, setDueDate] = useState<string>(assignment.dueDate);
    const [dueTime, setDueTime] = useState<string>(initialDueTime);
    const [description, setDescription] = useState<string>(assignment.description ?? "");

    const [errors, setErrors] = useState<Errors>({});

    const isDueDateDirty = dueDate !== assignment.dueDate;
    const isDueTimeDirty = dueTime !== initialDueTime;
    const isDescriptionDirty = description.trim() !== initialDescription;
    const isDirty = isDueDateDirty || isDueTimeDirty || isDescriptionDirty;

    const handleClose = () => {
        setDueDate(assignment.dueDate);
        setDueTime(initialDueTime);
        setDescription(assignment.description ?? "");
        setErrors({});
        onClose();
    }

    const { mutate, isPending } = useMutation({
        mutationFn: (data: UpdateWritingAssignmentRequest) => teacherWritingAssignmentApi.updateWritingAssignment(assignment.id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
            message.success(t("updateSuccess"));
            setErrors({});
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    })

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isDirty) return;

        const newErrors: Errors = {};

        if (!dueDate) newErrors.dueDateError = t("errors.dueDateRequired");
        if (!dueTime) newErrors.dueTimeError = t("errors.dueTimeRequired");

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const payload: UpdateWritingAssignmentRequest = {};

        if (isDueDateDirty) payload.dueDate = dueDate;
        if (isDueTimeDirty) payload.dueTime = dueTime;
        if (isDescriptionDirty) payload.description = description.trim();

        mutate(payload);
    }

    return (
        <Modal
            title={t("title")}
            subtitle={t("subtitle")}
            isOpen={isOpen}
            onClose={handleClose}
            size="2xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border p-3">
                    <div
                        className="shrink-0 overflow-hidden rounded-md bg-gray-100"
                        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                    >
                        {question.imageUrl ? (
                            <Image
                                src={question.imageUrl}
                                alt={question.title}
                                width={THUMB_SIZE}
                                height={THUMB_SIZE}
                                style={{ objectFit: "cover" }}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                                —
                            </div>
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="text-sm font-medium text-fg">{question.title}</p>
                        <p className="max-h-32 overflow-y-auto whitespace-pre-line text-sm text-muted">
                            {question.prompt}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                            <Tag variant="filled" color={TASK_TYPE_COLORS[question.taskType]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                {t(`taskType.${question.taskType}`)}
                            </Tag>
                            <Tag variant="filled" color={DIFFICULTY_COLORS[question.difficulty]} style={{ marginInlineEnd: 0, fontSize: 14 }}>
                                {t(`difficulty.${question.difficulty}`)}
                            </Tag>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <DateInput
                        label={t("dueDateLabel")}
                        value={dueDate}
                        onChange={setDueDate}
                        error={errors.dueDateError}
                    />

                    <TimeInput
                        label={t("dueTimeLabel")}
                        value={dueTime}
                        onChange={setDueTime}
                        error={errors.dueTimeError}
                    />
                </div>

                <TextInput
                    label={t("descriptionLabel")}
                    placeholder={t("descriptionPlaceholder")}
                    value={description}
                    onChange={setDescription}
                    type="textarea"
                    maxLength={1500}
                    rows={6}
                />

                <div className="flex justify-end">
                    <Button
                        label={t("submit")}
                        type="submit"
                        loading={isPending}
                        disabled={!isDirty}
                    />
                </div>
            </form>
        </Modal>
    )
}