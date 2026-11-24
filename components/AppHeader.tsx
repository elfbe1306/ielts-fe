"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Avatar, Dropdown, Image, MenuProps } from "antd";
import { useLocale, useTranslations, type Locale } from "next-intl";
import VietnamIcon from "./icons/flags/VietnamIcon";
import UsaIcon from "./icons/flags/UsaIcon";
import { ROUTES } from "@/lib/route";
import { useAuth } from "@/hooks/useAuth";
import { getInitial } from "@/lib/utils";
import { CSSProperties, useState, useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/authApi";
import GlobalIcon from "./icons/GlobalIcon";
import LogoutIcon from "./icons/LogoutIcon";
import ArrowDownIcon from "./icons/ArrowDownIcon";
import AppNav from "./AppNav";


const LOCALES: { code: Locale; label: string; icon: React.ReactNode }[] = [
    { code: "vi", label: "Tiếng Việt", icon: <VietnamIcon /> },
    { code: "en", label: "English", icon: <UsaIcon /> },
];

const AVATAR_STYLE: CSSProperties = {
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    fontWeight: 600,
    flexShrink: 0,
};

function isLocale(key: string): key is Locale {
    return LOCALES.some((l) => l.code === key);
}

export default function AppHeader() {
    const t = useTranslations("nav.account");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isChangingLocale, startTransition] = useTransition();
    const { user, isLoading } = useAuth();

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const { mutate, isPending } = useMutation({
        mutationFn: authApi.signOut,
        onSettled: () => {
            window.location.replace(`/${locale}${ROUTES.landing}`);
        }
    });

    const onMenuClick: MenuProps["onClick"] = ({ key }) => {
        if (isLocale(key)) {
            if (key === locale) return;
            startTransition(() => {
                router.replace(pathname, { locale: key });
            });
            return;
        }

        if (key === "sign-out") {
            mutate();
        }
    };

    const items: MenuProps["items"] = [
        {
            key: "language",
            label: t("language"),
            icon: <GlobalIcon width={16} height={16} />,
            children: LOCALES.map((l) => ({
                key: l.code,
                icon: l.icon,
                label: l.label,
            })),
        },
        { type: "divider" },
        {
            key: "sign-out",
            label: t("signOut"),
            icon: <LogoutIcon width={16} height={16} />,
            disabled: isPending
        },
    ];

    return (
        <header className="sticky top-0 z-10 bg-bg border-b border-border">
            <div className="flex items-center justify-between gap-6 min-h-20 px-6">
                <Link href={ROUTES.dashboard} className="shrink-0 flex items-center">
                    <Image
                        src="/WITLogo.png"
                        alt="IELTS WIT"
                        preview={false}
                        style={{ height: 64, width: "auto", maxWidth: "none" }}
                    />
                </Link>

                <div className="hidden lg:flex flex-1 min-w-0 justify-center">
                    {user && <AppNav role={user.role} />}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {isLoading ? (
                        <div className="h-11 w-44 animate-pulse rounded-full border border-border bg-surface" />
                    ) : user && (
                        <Dropdown
                            menu={{
                                items,
                                selectable: true,
                                selectedKeys: [locale],
                                onClick: onMenuClick,
                                style: { boxShadow: "none", background: "transparent" },
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                            disabled={isChangingLocale}
                            open={menuOpen}
                            onOpenChange={setMenuOpen}
                            popupRender={(menu) => (
                                <div className="min-w-64 overflow-hidden rounded-xl border border-border bg-bg shadow-[0_12px_32px_-8px_rgba(3,3,81,0.18)]">
                                    <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
                                        <Avatar size={42} style={{ ...AVATAR_STYLE, fontSize: 17 }}>
                                            {getInitial(user.fullName)}
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-fg">
                                                {user.fullName}
                                            </p>
                                            <span className="mt-1 inline-flex items-center rounded-full bg-accent-bg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                                                {t(`roles.${user.role}`)}
                                            </span>
                                        </div>
                                    </div>
                                    {menu}
                                </div>
                            )}
                        >
                            <button
                                type="button"
                                aria-label={t("account")}
                                className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-full border py-1 pl-1 pr-2.5 transition-all hover:border-accent hover:bg-surface ${
                                    menuOpen
                                        ? "border-accent bg-surface ring-3 ring-accent-bg"
                                        : "border-border bg-bg"
                                }`}
                            >
                                <Avatar size={34} style={{ ...AVATAR_STYLE, fontSize: 14 }}>
                                    {getInitial(user.fullName)}
                                </Avatar>

                                <span className="hidden sm:flex min-w-0 flex-col items-start leading-tight">
                                    <span className="max-w-40 truncate text-sm font-semibold text-fg">
                                        {user.fullName}
                                    </span>
                                    <span className="text-sm text-muted">{t(`roles.${user.role}`)}</span>
                                </span>

                                <ArrowDownIcon
                                    width={18}
                                    height={18}
                                    className={`text-muted transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                        </Dropdown>
                    )}
                </div>
            </div>
        </header>
    );
}