import { Role } from "@/types/auth-type";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Menu, type MenuProps } from "antd";
import { ROUTES } from "@/lib/route";
import { Link, usePathname } from "@/i18n/navigation";

type MenuItem = Required<MenuProps>["items"][number];

const QUESTION_BANK_ITEMS = [
    { href: ROUTES.questionBank.listening, labelKey: "listening" },
    { href: ROUTES.questionBank.reading, labelKey: "reading" },
    { href: ROUTES.questionBank.writing, labelKey: "writing" },
    { href: ROUTES.questionBank.speaking, labelKey: "speaking" },
] as const;

const LEAF_ROUTES = [
    ROUTES.dashboard,
    ROUTES.courses,
    ROUTES.students,
    ROUTES.users,
    ...QUESTION_BANK_ITEMS.map((i) => i.href),
].sort((a, b) => b.length - a.length);

type AppNavProps = {
    role: Role;
};

export default function AppNav({ role } : AppNavProps) {
    const t = useTranslations("nav.menu");
    const pathname = usePathname();

    const [openKeys, setOpenKeys] = useState<string[]>([]);

    const entries: { roles: Role[]; item: MenuItem }[] = [
        {
            roles: ["ADMIN", "TEACHER", "STUDENT"],
            item: {
                key: ROUTES.dashboard,
                label: (
                    <Link href={ROUTES.dashboard} replace>
                        {t("dashboard")}
                    </Link>
                ),
            }
        },
        {
            roles: ["TEACHER", "STUDENT"],
            item: {
                key: ROUTES.courses,
                label: (
                    <Link href={ROUTES.courses} replace>
                        {t("courses")}
                    </Link>
                ),
            },
        },
        {
            roles: ["TEACHER"],
            item: {
                key: ROUTES.questionBank.root,
                label: t("questionBank"),
                children: QUESTION_BANK_ITEMS.map((item) => ({
                    key: item.href,
                    label: (
                        <Link href={item.href} replace>
                            {t(`questionBankItems.${item.labelKey}`)}
                        </Link>
                    ),
                })),
            },
        },
        {
            roles: ["TEACHER"],
            item: {
                key: ROUTES.students,
                label: (
                    <Link href={ROUTES.students} replace>
                        {t("students")}
                    </Link>
                ),
            },
        },
        {
            roles: ["ADMIN"],
            item: {
                key: ROUTES.users,
                label: (
                    <Link href={ROUTES.users} replace>
                        {t("users")}
                    </Link>
                ),
            },
        }
    ];

    const items = entries.filter((entry) => entry.roles.includes(role)).map((entry) => entry.item);

    const selectedKeys = useMemo(() => {
        const match = LEAF_ROUTES.find(
            (href) => pathname === href || pathname.startsWith(href + "/")
        );
        return match ? [match] : [];
    }, [pathname]);

    return (
        <Menu
            mode="horizontal"
            items={items}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            onClick={() => setOpenKeys([])}
            disabledOverflow
            style={{ borderBottom: "none", background: "transparent" }}
        />
    );
}