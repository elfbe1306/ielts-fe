import Button from "../Button";
import { useTranslations } from "next-intl";
import PencilAiIcon from "../icons/PencilAiIcon";

type AiAssistMenuProps = {
    onFix: () => void;
    isLoading?: boolean;
}

export default function AiAssistMenu({ onFix, isLoading = false } : AiAssistMenuProps) {
    const t = useTranslations("writingWorkspace.aiAssistMenu");

    return (
        <div className="flex items-center gap-2">
            <Button
                label={t("fix")}
                type="button"
                variant="tertiary"
                size="sm"
                icon={<PencilAiIcon width={16} height={16} />}
                loading={isLoading}
                onClick={onFix}
            />
        </div>
    );
}