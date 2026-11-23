import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";

export default function AppNotFound() {
    const t = useTranslations("notFound");

    return (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="font-serif text-5xl font-bold text-accent">404</p>
            <h1 className="font-serif text-2xl font-bold">{t("title")}</h1>
            <p className="max-w-md text-sm text-muted">{t("subtitle")}</p>
            <Link
                href={ROUTES.dashboard}
                className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
                {t("backToDashboard")}
            </Link>
        </div>
    );
}