import AppBreadcrumb from "@/components/AppBreadcrumb";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";

export default function ReadingPracticeLayout({ children } : { children: React.ReactNode }) {
    const t = useTranslations("reading.breadcrumbs");

    return (
        <>
            <AppBreadcrumb
                items={[
                    { title: t("practices"), path: ROUTES.practices.root },
                    { title: t("reading"), path: ROUTES.practices.reading },
                ]}
            />

            <div className="mt-4">
                {children}
            </div>
        </>
    );
}