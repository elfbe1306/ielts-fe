"use client";

import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useAppMessage } from "@/contexts/message-context";
import { useState } from "react";
import Button from "../Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateStudentRequest } from "@/types/student-type";
import { studentApi } from "@/lib/api/studentApi";
import TextInput from "../form-input/TextInput";
import { studentKeys } from "@/lib/queries/studentQueries";

type CreateStudentModalProps = {
    isOpen: boolean;
    onClose: () => void;
}

type Errors = {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
};

export default function CreateStudentModal({ isOpen, onClose } : CreateStudentModalProps) {
    const t = useTranslations("students.createStudentModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");

    const [errors, setErrors] = useState<Errors>({});

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateStudentRequest) => studentApi.createStudentAccount(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
            message.success(t("createSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    })

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

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

        mutate({ fullName, email, phoneNumber });
    }

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
                    />
                </div>
            </form>
        </Modal>
    )
}