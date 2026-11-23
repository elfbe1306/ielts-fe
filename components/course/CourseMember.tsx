import { courseMemberKeys, courseMemberQueries } from "@/lib/queries/courseMemberQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation";
import MemberGroup from "./MemberGroup";
import { AssignableCourseRole, CourseMember as CourseMemberType, UpdateCourseMemberRequest } from "@/types/course-member-type";
import Button from "../Button";
import PlusIcon from "../icons/PlusIcon";
import { useState } from "react";
import AddCourseMemberModal from "../modals/AddCourseMemberModal";
import { Popconfirm, Select } from "antd";
import TrashIcon from "../icons/TrashIcon";
import { courseMemberApi } from "@/lib/api/courseMemberApi";
import { useAppMessage } from "@/contexts/message-context";
import { courseKeys } from "@/lib/queries/courseQueries";
import { studentKeys } from "@/lib/queries/studentQueries";

type UpdateMemberVariables = {
    userId: string;
    data: UpdateCourseMemberRequest;
}

export default function CourseMember() {
    const { courseId } = useParams<{ courseId: string; }>();
    const t = useTranslations("courseDetail.courseMember");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

    const { data: members = [], isLoading, error } = useQuery(courseMemberQueries.list(courseId));

    const { mutate: updateMember, isPending: isUpdatingMember } = useMutation({
        mutationFn: ({ userId, data } : UpdateMemberVariables) => courseMemberApi.updateMember(courseId, userId, data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: courseMemberKeys.list(courseId) }),
                queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId), exact: true }),
                queryClient.invalidateQueries({ queryKey: courseKeys.lists() }),
            ]);
            message.success(t("changeRoleSuccess"));
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const { mutateAsync: deleteMember } = useMutation({
        mutationFn: (userId: string) => courseMemberApi.deleteMember(courseId, userId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: courseMemberKeys.list(courseId) }),
                queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId), exact: true }),
                queryClient.invalidateQueries({ queryKey: courseKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: studentKeys.lists() }),
            ]);
            message.success(t("removeSuccess"));
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />;
    }
 
    if (error) {
        return (
            <div className="rounded-2xl border border-error/40 bg-error-bg px-6 py-10 text-center text-sm text-error">
                {error.message}
            </div>
        );
    }

    const staff = members.filter((m) => m.role !== "STUDENT");
    const students = members.filter((m) => m.role === "STUDENT");

    const roleOptions: { value: AssignableCourseRole; label: string }[] = [
        { value: "STUDENT", label: t("role.STUDENT") },
        { value: "ASSISTANT", label: t("role.ASSISTANT") },
    ];

    const handleRoleChange = (member: CourseMemberType, courseRole: AssignableCourseRole) => {
        updateMember({ userId: member.id, data: { courseRole } });
    };

    const renderRole = (member: CourseMemberType) => {
        if (member.role === "TEACHER") {
            return (
                <p className="text-sm text-muted">{t(`role.${member.role}`)}</p>
            )
        }

        return (
            <div className="flex items-center gap-2">
                <Select<AssignableCourseRole>
                    className="w-48"
                    value={member.role}
                    options={roleOptions}
                    loading={isUpdatingMember}
                    disabled={isUpdatingMember}
                    onChange={(courseRole) => handleRoleChange(member, courseRole)}
                />

                <Popconfirm
                    title={t("removePopconfirm.title")}
                    description={t("removePopconfirm.subtitle")}
                    placement="bottomRight"
                    okText={t("removePopconfirm.okText")}
                    cancelText={t("removePopconfirm.cancelText")}
                    okButtonProps={{ style: { cursor: "pointer" } }}
                    cancelButtonProps={{ style: { cursor: "pointer" } }}
                    onConfirm={() => deleteMember(member.id)}
                >
                    <button
                        type="button"
                        className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-bg text-muted transition-colors cursor-pointer hover:border-error hover:bg-error-bg hover:text-error"
                    >
                        <TrashIcon width={16} height={16} />
                    </button>
                </Popconfirm>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-end">
                <Button
                    variant="primary"
                    label={t("addButton")}
                    icon={<PlusIcon className="text-white" width={20} height={20}/>}
                    onClick={() => setIsAddModalOpen(true)}
                />
            </div>

            <MemberGroup 
                title={t("staffTitle")} 
                members={staff} 
                renderRole={renderRole}
            />

            <MemberGroup 
                title={t("studentTitle")} 
                members={students} 
                emptyText={t("studentEmpty")} 
                renderRole={renderRole}
            />

            {isAddModalOpen && (
                <AddCourseMemberModal
                    courseId={courseId}
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}
        </div>
    )
}