"use client";

import { useTransition } from "react";
import { useLocale, type Locale } from "next-intl";
import { Dropdown, type MenuProps } from "antd";
import { usePathname, useRouter } from "@/i18n/navigation";
import VietnamIcon from "./icons/flags/VietnamIcon";
import UsaIcon from "./icons/flags/UsaIcon";
import ArrowDownIcon from "./icons/ArrowDownIcon";

const LOCALES: { code: Locale; label: string; icon: React.ReactNode }[] = [
    { code: "vi", label: "Tiếng Việt", icon: <VietnamIcon /> },
    { code: "en", label: "English", icon: <UsaIcon /> },
];

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

    const items: MenuProps["items"] = LOCALES.map((l) => ({
        key: l.code,
        icon: l.icon,
        label: l.label,
    }));

    const onClick: MenuProps["onClick"] = ({ key }) => {
        if (key === locale) return;
        startTransition(() => {
            router.replace(pathname, { locale: key as Locale });
        });
    };

    return (
        <Dropdown
            trigger={["click"]}
            disabled={isPending}
            menu={{ items, selectable: true, selectedKeys: [locale], onClick }}
        >
            <button
                type="button"
                className="shrink-0 inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-2.5 text-fg transition-colors hover:bg-surface"
            >
                {current.icon}
                <ArrowDownIcon width={16} height={16} />
            </button>
        </Dropdown>
    );
}