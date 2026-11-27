import { useTranslations } from "next-intl";

export default function ReadingPracticesPage() {
    const t = useTranslations("reading");

    return (
        <>
            <div>
                <h1 className="font-serif font-bold text-2xl mb-1">
                    {t("title")}
                </h1>
                <p className="text-muted text-sm">
                    {t("subtitle")}
                </p>
            </div>
        </>
    )
}