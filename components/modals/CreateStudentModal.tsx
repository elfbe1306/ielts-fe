"use client";

import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useAppMessage } from "@/contexts/message-context";
import { useState } from "react";
import { Table, TableColumnsType } from "antd";
import Button from "../Button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Course, CourseStatus } from "@/types/course-type";
import { courseApi } from "@/lib/api/courseApi";
import { CreateStudentRequest } from "@/types/user-type";
import { userApi } from "@/lib/api/userApi";
import TextInput from "../form-input/TextInput";

const STATUS_STYLE: Record<CourseStatus, string> = {
    UPCOMING: "text-accent-active",
    ACTIVE: "text-success",
    ENDED: "text-muted",
};

type CreateStudentModalProps = {
    isOpen: boolean;
    onClose: () => void;
}

type Errors = {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
};

type CourseTableProps = {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
};

function CourseTable({ selectedIds, onSelectionChange }: CourseTableProps) {
    const t = useTranslations("teacherStudentsPage.createStudentModal");

    const { data, isPending, isError } = useQuery({
        queryKey: ["courses", "enrollable"],
        queryFn: () => courseApi.listEnrollable({ page: 0, size: 100 }),
    });

    const isFull = (course: Course) => course.enrolledCount >= course.maxStudents;

    const columns: TableColumnsType<Course> = [
        {
            title: t("columns.name"),
            dataIndex: "name",
            width: "50%",
        },
        {
            title: t("columns.enrollment"),
            key: "enrollment",
            width: "25%",
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        {record.enrolledCount}/{record.maxStudents}
                    </span>
                    {isFull(record) && (
                        <span className="text-sm px-2 py-1 rounded bg-error/10 text-error">
                            {t("full")}
                        </span>
                    )}
                </div>
            )
        },
        {
            title: t("columns.status"),
            dataIndex: "status",
            width: "25%",
            render: (status: CourseStatus) => (
                <span className={`text-sm ${STATUS_STYLE[status]}`}>
                    {t(`status.${status}`)}
                </span>
            ),
        },
    ];

    if (isError) {
        return <p className="text-sm text-error">{t("courseLoadError")}</p>;
    }

    return (
        <Table<Course>
            rowKey="id"
            loading={isPending}
            rowSelection={{
                selectedRowKeys: selectedIds,
                onChange: (keys) => onSelectionChange(keys as string[]),
                getCheckboxProps: (record) => ({ disabled: isFull(record) }),
            }}
            columns={columns}
            dataSource={data?.content ?? []}
            pagination={false}
            scroll={{ y: 200 }}
            bordered={true}
            size="small"
        />
    );
}

export default function CreateStudentModal({ isOpen, onClose } : CreateStudentModalProps) {
    const t = useTranslations("teacherStudentsPage.createStudentModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    const [errors, setErrors] = useState<Errors>({});

    const { mutate, isPending } = useMutation({
        mutationFn: (data: CreateStudentRequest) => userApi.createStudentAccount(data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["students"]}),
                queryClient.invalidateQueries({ queryKey: ["courses", "enrollable"]})
            ]);
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

        mutate({
            fullName,
            email,
            phoneNumber,
            courseIds: selectedCourseIds
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

                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-fg">
                        {t("courseLabel")}
                    </p>
                    <CourseTable
                        selectedIds={selectedCourseIds}
                        onSelectionChange={setSelectedCourseIds}
                    />
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