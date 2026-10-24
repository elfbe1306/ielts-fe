"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import { Menu, type MenuProps } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type MenuItem = Required<MenuProps>["items"][number];

const LEAF_ROUTES = [
    ROUTES.admin.dashboard,
    ROUTES.admin.users,
].sort((a, b) => b.length - a.length);

export default function AdminNav() {
    const pathname = usePathname();
    const t = useTranslations("nav.admin");

    const items: MenuItem[] = [
        {
            key: ROUTES.admin.dashboard,
            label: (
                <Link href={ROUTES.admin.dashboard} replace>
                    {t("dashboard")}
                </Link>
            ),
        },
        {
            key: ROUTES.admin.users,
            label: (
                <Link href={ROUTES.admin.users} replace>
                    {t("users")}
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