"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import { Menu, type MenuProps } from "antd";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type MenuItem = Required<MenuProps>["items"][number];

const QB = ROUTES.teacher.questionBank;

const QUESTION_BANK_ITEMS = [
    { href: QB.listening, labelKey: "listening" },
    { href: QB.reading, labelKey: "reading" },
    { href: QB.writing, labelKey: "writing" },
    { href: QB.speaking, labelKey: "speaking" },
] as const;

// Route lá để xác định mục active — dài trước để khớp cụ thể nhất
const LEAF_ROUTES = [
    ROUTES.teacher.dashboard,
    ROUTES.teacher.courses,
    ROUTES.teacher.students,
    ...QUESTION_BANK_ITEMS.map((i) => i.href),
].sort((a, b) => b.length - a.length);

export default function TeacherNav() {
    const pathname = usePathname();
    const t = useTranslations("nav.teacher");

    const [openKeys, setOpenKeys] = useState<string[]>([]);

    const items: MenuItem[] = [
        {
            key: ROUTES.teacher.dashboard,
            label: (
                <Link href={ROUTES.teacher.dashboard} replace>
                    {t("dashboard")}
                </Link>
            ),
        },
        {
            key: ROUTES.teacher.courses,
            label: (
                <Link href={ROUTES.teacher.courses} replace>
                    {t("courses")}
                </Link>
            ),
        },
        {
            key: QB.root,
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
        {
            key: ROUTES.teacher.students,
            label: (
                <Link href={ROUTES.teacher.students} replace>
                    {t("students")}
                </Link>
            ),
        },
    ];

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