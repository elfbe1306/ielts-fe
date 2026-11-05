import { ResponseLanguage } from "@/types/writing-correction-type";
import Button from "../Button";
import { useLocale, useTranslations } from "next-intl";
import PencilAiIcon from "../icons/PencilAiIcon";

type AiAssistMenuProps = {
    onFix: (language: ResponseLanguage) => void;
    isLoading?: boolean;
}

export default function AiAssistMenu({ onFix, isLoading = false } : AiAssistMenuProps) {
    const t = useTranslations("writingWorkspace.aiAssistMenu");
    const locale = useLocale();

    const language: ResponseLanguage = locale === "vi" ? "VI" : "EN";

    return (
        <div className="flex items-center gap-2">
            <Button
                label={t("fix")}
                type="button"
                variant="tertiary"
                size="sm"
                icon={<PencilAiIcon width={16} height={16} />}
                loading={isLoading}
                onClick={() => onFix(language)}
            />
        </div>
    );
}