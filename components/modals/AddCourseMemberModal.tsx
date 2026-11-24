import { useTranslations } from "next-intl";
import Modal from "./Modal";
import TextInput from "../form-input/TextInput";
import SelectInput, { SelectOption } from "../form-input/SelectInput";
import Button from "../Button";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentKeys, studentQueries } from "@/lib/queries/studentQueries";
import { getInitial } from "@/lib/utils";
import { Student } from "@/types/student-type";
import { AddCourseMemberRequest, AssignableCourseRole } from "@/types/course-member-type";
import { courseMemberApi } from "@/lib/api/courseMemberApi";
import { useAppMessage } from "@/contexts/message-context";
import { courseMemberKeys } from "@/lib/queries/courseMemberQueries";
import { courseKeys } from "@/lib/queries/courseQueries";

const SEARCH_PAGE_SIZE = 5;

type AddCourseMemberModalProps = {
    courseId: string;
    canAssignRole: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddCourseMemberModal({ courseId, canAssignRole, isOpen, onClose } : AddCourseMemberModalProps) {
    const t = useTranslations("courseDetail.addCourseMemberModal");
    const message = useAppMessage();
    const queryClient = useQueryClient();

    const [query, setQuery] = useState<string>("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [role, setRole] = useState<AssignableCourseRole>("STUDENT");
    const debouncedQuery = useDebounce(query.trim(), 400);

    const { data, isFetching, isError } = useQuery({
        ...studentQueries.list({ page: 0, size: SEARCH_PAGE_SIZE, search: debouncedQuery }),
        enabled: debouncedQuery.length > 0,
    });

    const students = debouncedQuery ? data?.content ?? [] : [];

    const roleOptions: SelectOption<AssignableCourseRole>[] = [
        { value: "STUDENT", label: t("roles.STUDENT") },
        { value: "ASSISTANT", label: t("roles.ASSISTANT") },
    ];

    const handleQueryChange = (value: string) => {
        setQuery(value);
        setSelectedStudent(null);
    };

    const handleSelect = (student: Student) => {
        setSelectedStudent((current) => (current?.id === student.id ? null : student));
    };

    const { mutate, isPending } = useMutation({
        mutationFn: (data: AddCourseMemberRequest) => courseMemberApi.addMember(courseId, data),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: courseMemberKeys.list(courseId) }),
                queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId), exact: true }),
                queryClient.invalidateQueries({ queryKey: courseKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: studentKeys.lists() }),
            ]);
            message.success(t("addSuccess"));
            onClose();
        },
        onError: (error) => {
            message.error(error.message);
        }
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedStudent) return;

        mutate({ 
            userId: selectedStudent.id,  
            courseRole: canAssignRole ? role : "STUDENT"
        });
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
                    label={t("searchLabel")}
                    placeholder={t("searchPlaceholder")}
                    value={query}
                    onChange={handleQueryChange}
                />

                {debouncedQuery && (
                    <div className="flex flex-col gap-2">
                        {isError ? (
                            <p className="text-sm text-error">{t("searchError")}</p>
                        ) : isFetching && students.length === 0 ? (
                            <p className="text-sm text-muted">{t("searching")}</p>
                        ) : students.length === 0 ? (
                            <p className="text-sm text-muted">{t("noResults")}</p>
                        ) : (
                            <ul className={`flex flex-col gap-2 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                                {students.map((student) => {
                                    const isMember = student.courses.some((course) => course.id === courseId);
                                    const isSelected = selectedStudent?.id === student.id;

                                    return (
                                        <li key={student.id}>
                                            <button
                                                type="button"
                                                disabled={isMember}
                                                onClick={() => handleSelect(student)}
                                                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                                                    isMember
                                                        ? "cursor-not-allowed border-border bg-surface opacity-60"
                                                        : isSelected
                                                            ? "cursor-pointer border-accent bg-accent-bg"
                                                            : "cursor-pointer border-border bg-bg hover:border-accent hover:bg-surface"
                                                }`}
                                            >
                                                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-bg text-sm font-semibold text-accent">
                                                    {getInitial(student.fullName)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-fg">{student.fullName}</p>
                                                    <p className="truncate text-sm text-muted">{student.email}</p>
                                                </div>

                                                {isMember && (
                                                    <span className="flex-none text-sm text-muted">
                                                        {t("alreadyMember")}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}

                <SelectInput<AssignableCourseRole>
                    label={t("roleLabel")}
                    options={roleOptions}
                    value={canAssignRole ? role : "STUDENT"}
                    onChange={setRole}
                    disabled={!selectedStudent || !canAssignRole}
                />

                <div className="flex justify-end">
                    <Button
                        label={t("submit")}
                        type="submit"
                        disabled={!selectedStudent}
                        loading={isPending}
                    />
                </div>
            </form>
        </Modal>
    )
}