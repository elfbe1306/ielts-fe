import AppBreadcrumb from "@/components/AppBreadcrumb";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";

export default function ListeningPracticeLayout({ children } : { children: React.ReactNode }) {
    const t = useTranslations("listening.breadcrumbs");

    return (
        <>
            <AppBreadcrumb
                items={[
                    { title: t("practices"), path: ROUTES.practices.root },
                    { title: t("listening"), path: ROUTES.practices.listening },
                ]}
            />

            <div className="mt-4">
                {children}
            </div>
        </>
    );
}