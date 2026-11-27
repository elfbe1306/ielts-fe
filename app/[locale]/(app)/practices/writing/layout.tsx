import AppBreadcrumb from "@/components/AppBreadcrumb";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";

export default function WritingPracticeLayout({ children } : { children: React.ReactNode }) {
    const t = useTranslations("writing.breadcrumbs");

    return (
        <>
            <AppBreadcrumb
                items={[
                    { title: t("practices"), path: ROUTES.practices.root },
                    { title: t("writing"), path: ROUTES.practices.writing },
                ]}
            />

            <div className="mt-4">
                {children}
            </div>
        </>
    );
}