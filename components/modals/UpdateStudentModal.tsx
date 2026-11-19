"use client";

import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useMemo, useState } from "react";
import { useAppMessage } from "@/contexts/message-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../Button";
import { Student, UpdateStudentRequest } from "@/types/student-type";
import { studentApi } from "@/lib/api/studentApi";
import TextInput from "../form-input/TextInput";
import { studentKeys } from "@/lib/queries/studentQueries";

type UpdateStudentModalProps = {
    student: Student;
    isOpen: boolean;
    onClose: () => void;
};

type Errors = {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
};

export default function UpdateStudentModal({ student, isOpen, onClose } : UpdateStudentModalProps) {
    const t = useTranslations("teacherStudentsPage.updateStudentModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [fullName, setFullName] = useState<string>(student.fullName);
    const [email, setEmail] = useState<string>(student.email);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(student.phoneNumber);

    const [errors, setErrors] = useState<Errors>({});

    const isPhoneNumberDirty = (phoneNumber ?? "") !== (student.phoneNumber ?? "");

    const isDirty = useMemo(() => {
        return (
            fullName !== student.fullName ||
            email !== student.email ||
            isPhoneNumberDirty
        );
    }, [fullName, email, isPhoneNumberDirty, student]);

    const { mutate, isPending } = useMutation({
        mutationFn: (data: UpdateStudentRequest) => studentApi.updateStudentAccount(student.id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
            message.success(t("updateSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isDirty) return;

        const newErrors: Errors = {};

        if (!fullName.trim()) {
            newErrors.fullName = t("errors.fullNameRequired");
        }

        if (!email.trim()) {
            newErrors.email = t("errors.emailRequired");
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const payload: UpdateStudentRequest = {};
        
        if (fullName !== student.fullName) payload.fullName = fullName;
        if (email !== student.email) payload.email = email;
        if (isPhoneNumberDirty) payload.phoneNumber = phoneNumber ?? "";

        mutate(payload);
    };

    return (
        <Modal
            title={t("title")}
            subtitle={t("subtitle")}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <TextInput
                    label={t("fullNameLabel")}
                    placeholder={t("fullNamePlaceholder")}
                    value={fullName}
                    onChange={setFullName}
                    error={errors.fullName}
                />

                <TextInput
                    type={"email"}
                    label={t("emailLabel")}
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                />

                <TextInput
                    label={t("phoneLabel")}
                    placeholder={t("phonePlaceholder")}
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    error={errors.phoneNumber}
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