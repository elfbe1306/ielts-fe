import { CorrectionAttrs, CRITERIA, Criterion, CRITERION_STYLES } from "@/types/writing-assignment-type";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "../Button";
import TextInput from "../form-input/TextInput";

const CRITERION_BUTTON_BASE_CLASS = "rounded-md py-1.5 text-sm transition-colors";
const CRITERION_BUTTON_INACTIVE_CLASS = "bg-bg text-muted inset-ring inset-ring-border";

export type CorrectionPatch = Pick<CorrectionAttrs, "criterion" | "text" | "description">;

type CorrectionEditFormProps = {
    attrs: CorrectionAttrs;
    original: string;
    onSave: (patch: CorrectionPatch) => void;
    onCancel: () => void;
};

export default function CorrectionEditForm({ attrs, original, onSave, onCancel }: CorrectionEditFormProps) {
    const t = useTranslations("writingWorkspace.correctionMenu");

    const [criterion, setCriterion] = useState<Criterion>(attrs.criterion);
    const [text, setText] = useState<string>(attrs.text);
    const [description, setDescription] = useState<string>(attrs.description);

    const needsText = attrs.type === "replace" || attrs.type === "insert";
    const isComment = attrs.type === "comment";

    const canSave =
        (!needsText || text.trim() !== "") &&
        (!isComment || description.trim() !== "");

    const handleSave = () => {
        if (!canSave) return;

        onSave({
            criterion,
            text: needsText ? text.trim() : "",
            description: description.trim(),
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">
                {t("selected")}: <span className="text-fg">“{original}”</span>
            </p>

            {attrs.type === "replace" && (
                <TextInput
                    size="sm"
                    label={t("replaceWith")}
                    placeholder={t("replacePlaceholder")}
                    value={text}
                    onChange={setText}
                />
            )}

            {attrs.type === "insert" && (
                <TextInput
                    size="sm"
                    label={t("insertText")}
                    placeholder={t("insertPlaceholder")}
                    value={text}
                    onChange={setText}
                />
            )}

            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-fg">{t("criterion")}</p>
                <div className="grid grid-cols-4 gap-1">
                    {CRITERIA.map((value) => {
                        const isActive = criterion === value;
                        const style = CRITERION_STYLES[value];

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setCriterion(value)}
                                className={`${CRITERION_BUTTON_BASE_CLASS} ${
                                    isActive ? style.active : `${CRITERION_BUTTON_INACTIVE_CLASS} ${style.hover}`
                                }`}
                            >
                                {value}
                            </button>
                        );
                    })}
                </div>
            </div>

            <TextInput
                size="sm"
                type="textarea"
                rows={3}
                label={isComment ? t("comment") : t("description")}
                placeholder={isComment ? t("commentPlaceholder") : t("descriptionPlaceholder")}
                value={description}
                onChange={setDescription}
            />

            <div className="flex justify-end gap-2">
                <Button label={t("cancel")} type="button" variant="secondary" size="sm" onClick={onCancel} />
                <Button label={t("save")} type="button" size="sm" disabled={!canSave} onClick={handleSave} />
            </div>
        </div>
    );
}