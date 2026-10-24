"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import { Menu, type MenuProps } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type MenuItem = Required<MenuProps>["items"][number];

const LEAF_ROUTES = [
    ROUTES.student.dashboard,
    ROUTES.student.courses,
].sort((a, b) => b.length - a.length);

export default function StudentNav() {
    const pathname = usePathname();
    const t = useTranslations("nav.student");

    const items: MenuItem[] = [
        {
            key: ROUTES.student.dashboard,
            label: (
                <Link href={ROUTES.student.dashboard} replace>
                    {t("dashboard")}
                </Link>
            ),
        },
        {
            key: ROUTES.student.courses,
            label: (
                <Link href={ROUTES.student.courses} replace>
                    {t("courses")}
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
            disabledOverflow
            style={{ borderBottom: "none", background: "transparent" }}
        />
    );
}