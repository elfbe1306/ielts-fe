"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";

export default function StudentCourseNotFound() {
    const t = useTranslations("studentCourseDetailPage.notFound");

    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg px-6 py-16 text-center">
            <p className="font-serif text-xl font-bold">{t("title")}</p>
            <p className="text-sm text-muted">{t("subtitle")}</p>
            <Link
                href={ROUTES.student.courses}
                className="mt-2 text-sm font-medium text-accent hover:underline"
            >
                {t("backToCourses")}
            </Link>
        </div>
    );
}