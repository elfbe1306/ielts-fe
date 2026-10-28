"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "../Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppMessage } from "@/contexts/message-context";
import { CreateCourseRequest } from "@/types/course-type";
import { teacherCourseApi } from "@/lib/api/teacher/teacherCourseApi";
import Modal from "./Modal";
import TextInput from "../form-input/TextInput";
import DateInput from "../form-input/DateInput";

type CreateCourseModalProps = {
    isOpen: boolean;
    onClose: () => void;
}

type Errors = {
    name?: string;
    session?: string;
    minStudents?: string;
    maxStudents?: string;
    range?: string;
    startDate?: string;
}

export default function CreateCourseModal({ isOpen, onClose }: CreateCourseModalProps) {
    const t = useTranslations("teacherCoursesPage.createCourseModal");
    const message = useAppMessage();

    const [name, setName] = useState<string>("");
    const [session, setSession] = useState<number | "">("");
    const [minStudents, setMinStudents] = useState<number | "">("");
    const [maxStudents, setMaxStudents] = useState<number | "">("");
    const [startDate, setStartDate] = useState<string>("");

    const [errors, setErrors] = useState<Errors>({});

    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateCourseRequest) => teacherCourseApi.createCourse(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["courses"] });
            message.success(t("createSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Errors = {};

        if (!name.trim()) newErrors.name = t("errors.nameRequired");
        if (session === "" || session <= 0) newErrors.session = t("errors.sessionRequired");
        if (minStudents === "" || minStudents < 0) newErrors.minStudents = t("errors.minStudentsRequired");
        if (maxStudents === "" || maxStudents <= 0) newErrors.maxStudents = t("errors.maxStudentsRequired");
        if (
            minStudents !== "" && maxStudents !== "" &&
            !newErrors.minStudents && !newErrors.maxStudents &&
            minStudents > maxStudents
        ) {
            newErrors.range = t("errors.rangeInvalid");
        }
        if (!startDate) newErrors.startDate = t("errors.startDateRequired");

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        mutate({
            name: name.trim(),
            startDate,
            totalSessions: Number(session),
            minStudents: Number(minStudents),
            maxStudents: Number(maxStudents)
        });
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("title")}
            subtitle={t("subtitle")}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <TextInput
                    label={t("nameLabel")}
                    placeholder={t("namePlaceholder")}
                    value={name}
                    onChange={setName}
                    error={errors.name}
                />

                <TextInput
                    label={t("sessionLabel")}
                    placeholder={t("sessionPlaceholder")}
                    type="number"
                    value={session}
                    onChange={setSession}
                    error={errors.session}
                />

                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-fg">{t("rangeLabel")}</p>
                    <div className="flex items-center gap-2.5">
                        <TextInput
                            placeholder={t("minPlaceholder")}
                            type="number"
                            value={minStudents}
                            onChange={setMinStudents}
                            error={errors.minStudents}
                        />

                        <p className="text-muted">-</p>

                        <TextInput
                            placeholder={t("maxPlaceholder")}
                            type="number"
                            value={maxStudents}
                            onChange={setMaxStudents}
                            error={errors.maxStudents}
                        />

                        <p className="text-muted text-sm whitespace-nowrap">{t("rangeSuffix")}</p>
                    </div>
                    {errors.range && <p className="text-sm text-error">{errors.range}</p>}
                </div>

                <DateInput
                    label={t("dateLabel")}
                    value={startDate}
                    onChange={setStartDate}
                    error={errors.startDate}
                />

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