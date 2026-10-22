import { Image, Menu, MenuProps } from "antd";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import LocaleSwitcher from "./LocaleSwitcher";

export default function PublicHeader() {
    const t = useTranslations("nav");

    const items: MenuProps["items"] = [
        { key: "intro", label: <a href="#intro">{t("intro")}</a> },
        { key: "experience", label: <a href="#experience">{t("experience")}</a> },
        { key: "roadmap", label: <a href="#roadmap">{t("roadmap")}</a> },
        { key: "schedule", label: <a href="#schedule">{t("schedule")}</a> },
        { key: "method", label: <a href="#method">{t("method")}</a> },
        { key: "register", label: <a href="#register">{t("register")}</a> },
    ];

    return (
        <header className="sticky top-0 z-10 bg-bg border-b border-border">
            <div className="flex items-center justify-between gap-6 min-h-20 px-6">
                <Link href={ROUTES.landing} className="shrink-0 flex items-center">
                    <Image
                        src="/WITLogo.png"
                        alt="IELTS WIT"
                        preview={false}
                        style={{ height: 64, width: "auto", maxWidth: "none" }}
                    />
                </Link>

                <div className="hidden lg:block flex-1 min-w-0">
                    <Menu
                        mode="horizontal"
                        items={items}
                        selectable={false}
                        className="justify-center"
                        style={{ borderBottom: "none", background: "transparent" }}
                    />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <LocaleSwitcher />
                    <Link
                        href={ROUTES.signIn}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                    >
                        {t("signIn")}
                    </Link>
                </div>
            </div>
        </header>
    )
}