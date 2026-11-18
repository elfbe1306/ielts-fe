import { getInitial } from "@/lib/utils";
import { CourseMember } from "@/types/course-member-type";
import { ReactNode } from "react";

type MemberGroupProps = {
    title: string;
    members: CourseMember[];
    emptyText?: string;
    renderRole: (member: CourseMember) => ReactNode;
}

export default function MemberGroup({ title, members, emptyText, renderRole } : MemberGroupProps) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-muted">{title}</p>

            {members.length === 0 ? (
                emptyText && (
                    <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center text-sm text-muted">
                        {emptyText}
                    </div>
                )
            ) : (
                <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-bg">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-5 py-3.5">
                            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold">
                                {getInitial(member.fullName)}
                            </div>
 
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{member.fullName}</p>
                                <p className="truncate text-xs text-muted">{member.email}</p>
                            </div>
 
                            {renderRole(member)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}