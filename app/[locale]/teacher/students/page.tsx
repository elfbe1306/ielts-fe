"use client";

import Button from "@/components/Button";
import TextInput from "@/components/form-input/TextInput";
import PencilIcon from "@/components/icons/PencilIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import CreateStudentModal from "@/components/modals/CreateStudentModal";
import UpdateStudentModal from "@/components/modals/UpdateStudentModal";
import { useAppMessage } from "@/contexts/message-context";
import { useDebounce } from "@/hooks/useDebounce";
import { teacherStudentApi } from "@/lib/api/teacher/teacherStudentApi";
import { formatInstant } from "@/lib/utils";
import { STATUS_STYLE } from "@/types/course-type";
import { CourseSummary, Student } from "@/types/user-type";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Popconfirm, Table, TableColumnsType } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

export default function TeacherStudentsPage() {
    const t = useTranslations("teacherStudentsPage");    
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [page, setPage] = useState<number>(0);
    const [search, setSearch] = useState<string>("");

    const debouncedSearch = useDebounce(search.trim(), 700);

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ["students", page, debouncedSearch],
        queryFn: () => teacherStudentApi.getAllStudentAccounts({ 
            page, 
            size: DEFAULT_PAGE_SIZE, 
            search: debouncedSearch || undefined 
        }),
        placeholderData: keepPreviousData,
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
    };

    const handleEditClick = (student: Student) => {
        setSelectedStudent(student);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateModalClose = () => {
        setIsUpdateModalOpen(false);
        setSelectedStudent(null);
    };

    const { mutateAsync } = useMutation({
        mutationFn: (userId: string) => teacherStudentApi.deleteStudentAccount(userId),
        onSuccess: async () => {
            if (page > 0 && data?.content.length === 1) {
                setPage(page - 1);
            }
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["students"]}),
                queryClient.invalidateQueries({ queryKey: ["courses", "enrollable"]})
            ]);
            message.success(t("deleteSuccess"));
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const columns: TableColumnsType<Student> = [
        {
            title: t("columns.fullName"),
            dataIndex: "fullName",
            key: "fullName",
            width: "15%",
            render: (fullName: string) => (
                <span>{fullName}</span>
            ),
        },
        {
            title: t("columns.email"),
            dataIndex: "email",
            key: "email",
            width: "20%"
        },
        {
            title: t("columns.phoneNumber"),
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            width: "13%",
            render: (phoneNumber: string | null) => phoneNumber || <span className="text-muted">—</span>,
        },
        {
            title: t("columns.courses"),
            dataIndex: "courses",
            key: "courses",
            width: "27%",
            render: (courses: CourseSummary[]) => 
                courses.length === 0 ? (
                    <span>{t("noCourses")}</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {courses.map((course) => (
                            <p 
                                key={course.id}
                                className={`inline-flex h-7 flex-none items-center whitespace-nowrap rounded-full px-3 text-sm font-medium ${STATUS_STYLE[course.status]}`}
                            >
                                {course.name}
                            </p>
                        ))}
                    </div>
                )
        },
        {
            title: t("columns.createdAt"),
            dataIndex: "createdAt",
            key: "createdAt",
            width: "15%",
            render: (createdAt: string) => (
                <span>{formatInstant(createdAt)}</span>
            )
        },
        {
            title: t("columns.action"),
            key: "action",
            width: "10%",
            render: (_, record) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        label=""
                        type="button"
                        variant="secondary"
                        icon={<PencilIcon width={16} height={16} />}
                        iconOnly={true}
                        onClick={() => handleEditClick(record)}
                    />

                    <Popconfirm
                        title={t("deletePopconfirm.title")}
                        description={t("deletePopconfirm.subtitle")}
                        placement="bottomRight"
                        okText={t("deletePopconfirm.okText")}
                        cancelText={t("deletePopconfirm.cancelText")}
                        okButtonProps={{ style: { cursor: "pointer" } }}
                        cancelButtonProps={{ style: { cursor: "pointer" } }}
                        onConfirm={() => mutateAsync(record.id).catch(() => {})}                                
                    >
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-bg text-muted transition-colors cursor-pointer hover:border-error hover:bg-error-bg hover:text-error"
                        >
                            <TrashIcon width={16} height={16} />
                        </button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif font-bold text-2xl mb-1">
                        {t("title")}
                    </h1>
                    <p className="text-muted text-sm">
                        {t("subtitle")}
                    </p>
                </div>

                <Button
                    variant="primary"
                    label={t("createButton")}
                    icon={<PlusIcon className="text-white" width={20} height={20}/>}
                    onClick={() => setIsCreateModalOpen(true)}
                />
            </div>

            <div className="mt-6 mb-4 max-w-sm">
                <TextInput
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t("searchPlaceholder")}
                />
            </div>

            {isError ? (
                <p className="text-sm text-error">{t("loadError")}</p>
            ) : (
                <Table<Student>
                    rowKey="id"
                    columns={columns}
                    dataSource={data?.content ?? []}
                    bordered={true}
                    size="small"
                    loading={isLoading || isFetching}
                    pagination={{
                        current: page + 1,
                        pageSize: DEFAULT_PAGE_SIZE,
                        total: data?.totalElements ?? 0,
                        onChange: (newPage: number) => setPage(newPage - 1),
                    }}
                />
            )}

            {isCreateModalOpen && (
                <CreateStudentModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {selectedStudent && isUpdateModalOpen && (
                <UpdateStudentModal
                    student={selectedStudent}
                    isOpen={isUpdateModalOpen}
                    onClose={handleUpdateModalClose}
                />
            )}
        </>
    )
}