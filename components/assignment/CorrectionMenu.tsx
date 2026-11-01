import { CorrectionType, CRITERIA, Criterion, CRITERION_STYLES } from "@/types/writing-assignment-type";
import { useEditorState, type Editor } from "@tiptap/react";
import { Segmented } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "../Button";
import TextInput from "../form-input/TextInput";

const TYPES: CorrectionType[] = ["replace", "delete", "insert", "comment"];

const CRITERION_BUTTON_BASE_CLASS = "rounded-md py-1.5 text-sm transition-colors";
const CRITERION_BUTTON_INACTIVE_CLASS = "bg-bg text-muted inset-ring inset-ring-border";

type CorrectionMenuProps = {
    editor: Editor;
};

export default function CorrectionMenu({ editor }: CorrectionMenuProps) {
    const t = useTranslations("writingWorkspace.correctionMenu");

    const [type, setType] = useState<CorrectionType>("replace");
    const [criterion, setCriterion] = useState<Criterion>("GRA");
    const [text, setText] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const selection = useEditorState({
        editor,
        selector: ({ editor }) => {
            const { from, to } = editor.state.selection;
            return { from, to, text: editor.state.doc.textBetween(from, to, " ") };
        },
    });

    const needsText = type === "replace" || type === "insert";
    const isComment = type === "comment";

    const canSubmit =
        selection.from !== selection.to &&
        (!needsText || text.trim() !== "") &&
        (!isComment || description.trim() !== "");

    const handleTypeChange = (value: CorrectionType) => {
        setType(value);
        setText("");
    };

    const handleSubmit = () => {
        if (!canSubmit) return;

        editor
            .chain()
            .focus()
            .addCorrection(
                { from: selection.from, to: selection.to },
                {
                    id: crypto.randomUUID(),
                    type,
                    criterion,
                    text: needsText ? text.trim() : "",
                    description: description.trim(),
                }
            )
            .setTextSelection(selection.to)
            .run();

        setText("");
        setDescription("");
    };

    return (
        <div className="flex w-90 flex-col gap-2 p-2">
            <Segmented<CorrectionType>
                block
                value={type}
                onChange={handleTypeChange}
                options={TYPES.map((value) => ({ value, label: t(`types.${value}`) }))}
            />

            <p className="text-sm text-muted">
                {t("selected")}: <span className="text-fg">“{selection.text}”</span>
            </p>

            {type === "replace" && (
                <TextInput
                    size="sm"
                    label={t("replaceWith")}
                    placeholder={t("replacePlaceholder")}
                    value={text}
                    onChange={setText}
                />
            )}

            {type === "insert" && (
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

            <div className="flex justify-end">
                <Button label={t("submit")} type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit} />
            </div>
        </div>
    );
}