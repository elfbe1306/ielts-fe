import AppBreadcrumb from "@/components/AppBreadcrumb";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";

export default function SpeakingPracticeLayout({ children } : { children: React.ReactNode }) {
    const t = useTranslations("speaking.breadcrumbs");

    return (
        <>
            <AppBreadcrumb
                items={[
                    { title: t("practices"), path: ROUTES.practices.root },
                    { title: t("speaking"), path: ROUTES.practices.speaking },
                ]}
            />

            <div className="mt-4">
                {children}
            </div>
        </>
    );
}