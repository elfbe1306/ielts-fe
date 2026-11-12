"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { ROLE_HOME, ROUTES } from "@/lib/route";
import { Role } from "@/types/auth-type";
import { Avatar, Dropdown, Image, type MenuProps } from "antd";
import { useAuth } from "@/contexts/auth-context";
import { useLocale, useTranslations, type Locale } from "next-intl";
import LogoutIcon from "./icons/LogoutIcon";
import GlobalIcon from "./icons/GlobalIcon";
import VietnamIcon from "./icons/flags/VietnamIcon";
import UsaIcon from "./icons/flags/UsaIcon";
import { useState, useTransition, type CSSProperties } from "react";
import ArrowDownIcon from "./icons/ArrowDownIcon";
import AdminNav from "./nav/AdminNav";
import TeacherNav from "./nav/TeacherNav";
import StudentNav from "./nav/StudentNav";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/authApi";

const NAV_BY_ROLE: Record<Role, React.ComponentType> = {
    ADMIN: AdminNav,
    TEACHER: TeacherNav,
    STUDENT: StudentNav,
};

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

function getInitial(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const lastName = parts[parts.length - 1];
    return lastName.charAt(0).toUpperCase();
}

export default function AppHeader({ role }: { role: Role }) {
    const t = useTranslations("nav.account");
    const { user, setUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const queryClient = useQueryClient();
    const [isChangingLocale, startTransition] = useTransition();

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const Nav = NAV_BY_ROLE[role];
    const roleLabel = t(`roles.${role}`);

    const { mutate, isPending } = useMutation({
        mutationFn: authApi.signOut,
        onSettled: () => {
            queryClient.clear();
            setUser(null);
            router.replace(ROUTES.landing);
            router.refresh();
        }
    });

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

    return (
        <header className="sticky top-0 z-10 bg-bg border-b border-border">
            <div className="flex items-center justify-between gap-6 min-h-20 px-6">
                <Link href={ROLE_HOME[role]} className="shrink-0 flex items-center">
                    <Image
                        src="/WITLogo.png"
                        alt="IELTS WIT"
                        preview={false}
                        style={{ height: 64, width: "auto", maxWidth: "none" }}
                    />
                </Link>

                <div className="hidden lg:flex flex-1 min-w-0 justify-center">
                    <Nav />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {user && (
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
                                                {roleLabel}
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
                                    <span className="text-xs text-muted">{roleLabel}</span>
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