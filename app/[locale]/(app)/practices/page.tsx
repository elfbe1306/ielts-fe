import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import BookIcon from "@/components/icons/BookIcon";
import HeadphoneIcon from "@/components/icons/HeadphoneIcon";
import { IconProps } from "@/components/icons/Icon";
import MicIcon from "@/components/icons/MicIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/route";
import { useTranslations } from "next-intl";

type SkillKey = "writing" | "reading" | "listening" | "speaking";

type Skill = {
    key: SkillKey;
    href: string;
    Icon: React.ComponentType<IconProps>;
    title: string;
    subtitle: string;
    tone: {
        iconBox: string;
        text: string;
        hover: string;
    };
};

export default function PracticesPage() {
    const t = useTranslations("practices");

    const skills: Skill[] = [
        {
            key: "listening",
            href: ROUTES.practices.listening,
            Icon: HeadphoneIcon,
            title: t("skills.listening.title"),
            subtitle: t("skills.listening.subtitle"),
            tone: { iconBox: "bg-sky-50 text-sky-700", text: "text-sky-700", hover: "hover:border-sky-300" },
        },
        {
            key: "reading",
            href: ROUTES.practices.reading,
            Icon: BookIcon,
            title: t("skills.reading.title"),
            subtitle: t("skills.reading.subtitle"),
            tone: { iconBox: "bg-emerald-50 text-emerald-700", text: "text-emerald-700", hover: "hover:border-emerald-300" },
        },
        {
            key: "writing",
            href: ROUTES.practices.writing,
            Icon: PencilIcon,
            title: t("skills.writing.title"),
            subtitle: t("skills.writing.subtitle"),
            tone: { iconBox: "bg-violet-50 text-violet-700", text: "text-violet-700", hover: "hover:border-violet-300" },
        },
        {
            key: "speaking",
            href: ROUTES.practices.speaking,
            Icon: MicIcon,
            title: t("skills.speaking.title"),
            subtitle: t("skills.speaking.subtitle"),
            tone: { iconBox: "bg-amber-50 text-amber-700", text: "text-amber-700", hover: "hover:border-amber-300" },
        },
    ];

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

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map(({ key, href, Icon, title, subtitle, tone }) => (
                <Link
                    key={key}
                    href={href}
                    className={`group relative flex min-h-50 flex-col overflow-hidden rounded-2xl border border-border bg-bg p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${tone.hover}`}
                >
                    <Icon
                        width={128}
                        height={128}
                        className={`pointer-events-none absolute -bottom-6 -right-6 opacity-[0.06] transition-transform duration-300 group-hover:scale-110 ${tone.text}`}
                    />

                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.iconBox}`}>
                        <Icon width={24} height={24} />
                    </span>

                    <span className="mt-3 flex flex-col gap-1">
                        <span className="font-serif text-xl font-bold text-fg">{title}</span>
                        <span className="text-sm text-muted">{subtitle}</span>
                    </span>

                    <span className={`relative mt-auto inline-flex items-center gap-1 text-sm font-semibold ${tone.text}`}>
                        {t("start")}
                        <ArrowRightIcon width={16} height={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                </Link>
            ))}
            </div>
        </>
    )
}