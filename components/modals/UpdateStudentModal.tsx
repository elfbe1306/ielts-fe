"use client";

import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useMemo, useState } from "react";
import { useAppMessage } from "@/contexts/message-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableColumnsType } from "antd";
import Button from "../Button";
import { Course, CourseStatus } from "@/types/course-type";
import { Student, UpdateStudentRequest } from "@/types/user-type";
import { courseApi } from "@/lib/api/courseApi";
import { userApi } from "@/lib/api/userApi";
import TextInput from "../form-input/TextInput";

const STATUS_STYLE: Record<CourseStatus, string> = {
    UPCOMING: "text-accent-active",
    ACTIVE: "text-success",
    ENDED: "text-muted",
};

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

type CourseTableProps = {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    enrolledIds?: string[];
};

function CourseTable({ selectedIds, onSelectionChange, enrolledIds = [] }: CourseTableProps) {
    const t = useTranslations("teacherStudentsPage.updateStudentModal");

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
                getCheckboxProps: (record) => ({
                    disabled: isFull(record) && !enrolledIds.includes(record.id),
                }),
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

export default function UpdateStudentModal({ student, isOpen, onClose } : UpdateStudentModalProps) {
    const t = useTranslations("teacherStudentsPage.updateStudentModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [fullName, setFullName] = useState<string>(student.fullName);
    const [email, setEmail] = useState<string>(student.email);
    const [phoneNumber, setPhoneNumber] = useState<string>(student.phoneNumber);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(student.courses.map((course) => course.id));

    const [errors, setErrors] = useState<Errors>({});

    const originalCourseIds = useMemo(() => student.courses.map((course) => course.id), [student]);

    const coursesChanged = useMemo(() => {
        return (
            selectedCourseIds.length !== originalCourseIds.length ||
            !selectedCourseIds.every((id) => originalCourseIds.includes(id))
        );
    }, [selectedCourseIds, originalCourseIds]);

    const isDirty = useMemo(() => {
        return (
            fullName !== student.fullName ||
            email !== student.email ||
            phoneNumber !== student.phoneNumber ||
            coursesChanged
        );
    }, [fullName, email, phoneNumber, student, coursesChanged]);

    const { mutate, isPending } = useMutation({
        mutationFn: (data: UpdateStudentRequest) => userApi.updateStudentAccount(student.id, data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["students"]}),
                queryClient.invalidateQueries({ queryKey: ["courses", "enrollable"]})
            ]);
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
        if (phoneNumber !== student.phoneNumber) payload.phoneNumber = phoneNumber;
        if (coursesChanged) payload.courseIds = selectedCourseIds;

        mutate(payload);
    };

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
                        enrolledIds={originalCourseIds}
                    />
                </div>

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