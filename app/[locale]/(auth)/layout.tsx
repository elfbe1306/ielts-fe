import { Image } from "antd";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import CheckCircleIcon from "@/components/icons/CheckCircleIcon";
import { useTranslations } from "next-intl";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("auth");
    const features = t.raw("features") as string[];

    return (
        <>
            <header className="border-b border-border bg-bg">
                <div className="flex items-center justify-between gap-6 min-h-20 px-6">
                    <Link href={ROUTES.landing} className="shrink-0 flex items-center">
                        <Image
                            src="/WITLogo.png"
                            alt="IELTS WIT"
                            preview={false}
                            style={{ height: 64, width: "auto", maxWidth: "none" }}
                        />
                    </Link>
                    <LocaleSwitcher />
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center bg-surface">
                <div className="flex items-center justify-center gap-18 w-full max-w-6xl p-7.5">
                    {/* Cột trái — promo panel, chỉ hiện khi màn hình đủ rộng */}
                    <div className="hidden lg:block flex-1 max-w-lg">
                        <p className="inline-flex items-center rounded-full bg-accent-bg px-3 py-1.25 text-sm font-bold text-accent-active mb-4.5">
                            IELTS WIT
                        </p>
                        <h2 className="font-serif font-bold text-4xl text-fg mb-4">
                            {t("headingLine1")}<br />{t("headingLine2")}
                        </h2>
                        <p className="text-muted leading-[1.6] max-w-[46ch] mb-6.5">
                            {t("description")}
                        </p>
                        <ul className="flex flex-col gap-3.5">
                            {features.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-fg">
                                    <CheckCircleIcon className="shrink-0 text-highlight" width={18} height={18} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Cột phải — form */}
                    <div className="w-full max-w-lg">
                        <div className="rounded-2xl border border-border bg-bg p-8 pb-7 shadow-[0_1px_2px_rgba(17,17,17,.04),0_12px_32px_-16px_rgba(17,17,17,.08)]">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}