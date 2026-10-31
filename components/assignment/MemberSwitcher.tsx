import { CourseMember } from "@/types/course-type";
import Button from "../Button";
import ArrowLeftIcon from "../icons/ArrowLeftIcon";
import ArrowRightIcon from "../icons/ArrowRightIcon";
import { Dropdown } from "antd";
import ArrowDownIcon from "../icons/ArrowDownIcon";
import { useTranslations } from "next-intl";

type MemberSwitcherProps = {
    members: CourseMember[];
    value: string | null;
    onChange: (userId: string) => void;
    currentUserId: string | null;
}

const TRIGGER_CLASS = [
    "inline-flex h-8 w-60 items-center justify-between gap-2 rounded-lg px-3 text-sm transition-colors cursor-pointer",
    "border border-border bg-bg text-fg",
    "hover:border-accent hover:bg-accent-bg hover:text-accent",
    "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export default function MemberSwitcher({ members, value, onChange, currentUserId } : MemberSwitcherProps) {
    const t = useTranslations("writingWorkspace.memberSwitcher");

    const currentIndex = members.findIndex((m) => m.id === value);
    const currentMember = currentIndex === -1 ? null : members[currentIndex];

    const getLabel = (member: CourseMember) => {
        let label = member.fullName;
        if (member.role === "TEACHER") label += ` (${t("teacher")})`;
        if (member.id === currentUserId) label += ` (${t("you")})`;
        return label;
    };

    // Đi vòng: cuối danh sách bấm tiếp thì quay về đầu
    const goTo = (offset: number) => {
        const total = members.length;
        if (total === 0) return;

        const isNext = offset > 0;
        const lastIndex = total - 1;

        let nextIndex: number;

        if (currentIndex === -1) {
            nextIndex = isNext ? 0 : lastIndex;
        } else if (isNext) {
            nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        } else {
            nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        }
        
        onChange(members[nextIndex].id);
    };

    const items = members.map((m) => ({
        key: m.id,
        label: (
            <span className="flex items-center gap-2">
                <span className="truncate">{getLabel(m)}</span>
            </span>
        ),
    }));


    return (
        <div className="flex items-center gap-3">
            <Button
                label=""
                type="button"
                variant="secondary"
                icon={<ArrowLeftIcon width={16} height={16} />}
                iconOnly={true}
                onClick={() => goTo(-1)}
            />

            <Button
                label=""
                type="button"
                variant="secondary"
                icon={<ArrowRightIcon width={16} height={16} />}
                iconOnly={true}
                onClick={() => goTo(1)}
            />

            <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                disabled={members.length === 0}
                menu={{
                    items,
                    selectable: true,
                    selectedKeys: value ? [value] : [],
                    onClick: ({ key }) => onChange(key),
                    style: { maxHeight: 320, overflowY: "auto" },
                }}
            >
                <button type="button" className={TRIGGER_CLASS}>
                    <span className="min-w-0 flex-1 truncate text-left">
                        {currentMember ? getLabel(currentMember) : t("placeholder")}
                    </span>
                    <ArrowDownIcon width={16} height={16} className="shrink-0" />
                </button>
            </Dropdown>
        </div>
    )
}