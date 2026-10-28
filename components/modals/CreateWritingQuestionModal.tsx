"use client";

import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useState } from "react";
import { Upload, UploadFile, UploadProps } from "antd";
import { useAppMessage } from "@/contexts/message-context";
import Dragger from "antd/es/upload/Dragger";
import Button from "../Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateWritingQuestionRequest, DIFFICULTIES, TASK_TYPES, WritingDifficulty, WritingTaskType } from "@/types/writing-question-type";
import SelectInput, { SelectOption } from "../form-input/SelectInput";
import TextInput from "../form-input/TextInput";
import FileUploadIcon from "../icons/FileUploadIcon";
import { teacherWritingQuestionApi } from "@/lib/api/teacher/teacherWritingQuestionApi";

const PROMPT_MAX_LENGTH = 1500;
const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type CreateWritingQuestionModalProps = {
    isOpen: boolean;
    onClose: () => void;
}

type Errors = {
    title?: string;
    prompt?: string;
    image?: string;
}

export default function CreateWritingQuestionModal({ isOpen, onClose } : CreateWritingQuestionModalProps) {
    const t = useTranslations("teacherQuestionBankWritingPage.createWritingQuestionModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [taskType, setTaskType] = useState<WritingTaskType>("TASK_1");
    const [difficulty, setDifficulty] = useState<WritingDifficulty>("MEDIUM");
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [errors, setErrors] = useState<Errors>({});

    const TASK_TYPE_LABELS: Record<WritingTaskType, string> = {
        TASK_1: "Task 1",
        TASK_2: "Task 2",
    };

    const TASK_TYPE_OPTIONS: SelectOption<WritingTaskType>[] = TASK_TYPES.map((value) => ({
        value,
        label: TASK_TYPE_LABELS[value],
    }));

    const difficultyLabels: Record<WritingDifficulty, string> = {
        EASY: t("difficultyEasy"),
        MEDIUM: t("difficultyMedium"),
        HARD: t("difficultyHard"),
    };

    const difficultyOptions: SelectOption<WritingDifficulty>[] = DIFFICULTIES.map((value) => ({
        value,
        label: difficultyLabels[value],
    }));

    const uploadProps: UploadProps = {
        name: "image",
        accept: ACCEPTED_IMAGE_TYPES.join(","),
        multiple: false,
        maxCount: 1,
        fileList,
        beforeUpload: (file) => {
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                setErrors((prev) => ({ ...prev, image: t("errorImageType") }));
                return Upload.LIST_IGNORE;
            }
            if (file.size / 1024 / 1024 > MAX_IMAGE_SIZE_MB) {
                setErrors((prev) => ({ ...prev, image: t("errorImageSize", { size: MAX_IMAGE_SIZE_MB }) }));
                return Upload.LIST_IGNORE;
            }
            setErrors((prev) => ({ ...prev, image: undefined }));
            return false;
        },
        onChange: ({ fileList: next }) => setFileList(next),
        onRemove: () => {
            setFileList([]);
            setErrors((prev) => ({ ...prev, image: undefined }));
        },
        listType: "picture",
    }

    const { mutate, isPending } = useMutation({
        mutationFn: (payload: CreateWritingQuestionRequest) => teacherWritingQuestionApi.create(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["writing-questions"] });
            message.success(t("createSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message)
        }
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Errors = {};

        if (!title.trim()) newErrors.title = t("errors.titleRequired");
        if (!prompt.trim()) newErrors.prompt = t("errors.promptRequired");

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        mutate({
            title,
            prompt,
            taskType,
            difficulty,
            image: fileList[0]?.originFileObj as File | undefined,
        });
    }

    return (
        <Modal
            title={t("title")}
            subtitle={t("subtitle")}
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <TextInput
                    label={t("titleLabel")}
                    placeholder={t("titlePlaceholder")}
                    value={title}
                    onChange={setTitle}
                    error={errors.title}
                />

                <TextInput
                    type="textarea"
                    label={t("promptLabel")}
                    placeholder={t("promptPlaceholder")}
                    value={prompt}
                    onChange={setPrompt}
                    maxLength={PROMPT_MAX_LENGTH}
                    rows={6}
                    rightSlot={
                        <span className="text-sm text-muted">
                            {prompt.length} / {PROMPT_MAX_LENGTH}
                        </span>
                    }
                    error={errors.prompt}
                />

                <div className="grid grid-cols-2 gap-3">
                    <SelectInput
                        label={t("typeLabel")}
                        options={TASK_TYPE_OPTIONS}
                        value={taskType}
                        onChange={setTaskType}
                    />

                    <SelectInput
                        label={t("difficultyLabel")}
                        options={difficultyOptions}
                        value={difficulty}
                        onChange={setDifficulty}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-fg">{t("uploadLabel")}</p>

                    <Dragger {...uploadProps}>
                        <div className="flex flex-col items-center justify-center gap-1.5">
                            <FileUploadIcon width={32} height={32} className="text-accent"/>
                            <p className="text-sm">{t("uploadText")}</p>
                            <p className="text-muted text-sm">{t("uploadHint", { size: MAX_IMAGE_SIZE_MB })}</p>
                        </div>
                    </Dragger>

                    {errors.image && <p className="text-sm text-error">{errors.image}</p>}
                </div>

                <div className="flex justify-end">
                    <Button
                        label={t("submit")}
                        type="submit"
                        loading={isPending}
                    />
                </div>
            </form>
        </Modal>
    )
}