import { useEditorState, type Editor } from "@tiptap/react";
import { Listy, Popconfirm } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { collectCorrections, CorrectionMark } from "./CorrectionMark";
import Button from "../Button";
import PencilIcon from "../icons/PencilIcon";
import TrashIcon from "../icons/TrashIcon";
import CorrectionEditForm, { CorrectionPatch } from "./CorrectionEditForm";
import { CorrectionRange } from "@/types/writing-correction-type";
import { CRITERIA, CRITERION_STYLES, CriterionFilter } from "@/types/writing-criterion-type";

const FILTERS: CriterionFilter[] = ["ALL", ...CRITERIA];

const CHIP_BASE_CLASS = "inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-sm font-medium transition-colors";
const CHIP_INACTIVE_CLASS = "bg-bg text-fg inset-ring inset-ring-border";
const CHIP_ALL_ACTIVE_CLASS = "bg-accent text-bg";
const CHIP_ALL_HOVER_CLASS = "hover:inset-ring-fg/40";
const COUNT_CLASS = "min-w-5 rounded-full bg-current/15 px-1.5 py-px text-center tabular-nums";

const CARD_CLASS = "flex w-full flex-col gap-2 rounded-xl border border-border bg-bg p-3";
const NUMBER_BADGE_CLASS = "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold";
const CRITERION_TAG_CLASS = "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold";
const BADGE_FALLBACK_CLASS = "bg-fg text-bg";

const ORIGINAL_CLASS = "font-serif text-error line-through decoration-error";
const NEW_TEXT_CLASS = "rounded-md bg-success-bg px-1.5 py-0.5 font-serif text-success";
const QUOTE_CLASS = "font-serif italic text-fg";

const DELETE_BUTTON_CLASS = "inline-flex h-7 w-7 flex-none items-center justify-center rounded-md border border-border bg-bg text-muted transition-colors cursor-pointer hover:border-error hover:bg-error-bg hover:text-error";

const LISTY_STYLES = {
    item: { padding: "0 0 8px", border: "none", background: "transparent" },
};

type CorrectionItem = CorrectionRange & {
    index: number;
    original: string;
};

type CorrectionPanelProps = {
    editor: Editor | null;
    readOnly?: boolean;
    canEdit?: boolean;
};

export default function CorrectionPanel({ editor, readOnly = false, canEdit = false }: CorrectionPanelProps) {
    const t = useTranslations("writingWorkspace.correctionPanel");

    const [filter, setFilter] = useState<CriterionFilter>("ALL");
    const [editingId, setEditingId] = useState<string | null>(null);

    const corrections: CorrectionItem[] =
        useEditorState({
            editor,
            selector: ({ editor }) => {
                if (!editor) return [];
                const { doc } = editor.state;

                return collectCorrections(doc, CorrectionMark.name).map((range, index) => ({
                    ...range,
                    index,
                    original: doc.textBetween(range.from, range.to, " "),
                }));
            },
        }) ?? [];

    const countOf = (item: CriterionFilter) =>
        item === "ALL" ? corrections.length : corrections.filter((c) => c.attrs.criterion === item).length;

    const visible = filter === "ALL" ? corrections : corrections.filter((c) => c.attrs.criterion === filter);

    const canModify = !readOnly;
    const showHeaderActions = canEdit || canModify;

    const handleApply = (id: string) => {
        if (!editor || !canModify) return;
        editor.commands.applyCorrection(id);
    };

    const handleRemove = (id: string) => {
        if (!editor || !canModify) return;
        editor.commands.removeCorrection(id);
    };

    const handleApplyAll = () => {
        if (!editor || !canModify) return;
        [...visible].reverse().forEach((item) => editor.commands.applyCorrection(item.attrs.id));
    };

    const handleRemoveAll = () => {
        if (!editor || !canModify) return;
        [...visible].reverse().forEach((item) => editor.commands.removeCorrection(item.attrs.id));
    };

    const handleUpdate = (id: string, patch: CorrectionPatch) => {
        if (!editor || !canEdit) return;
        editor.commands.updateCorrection(id, patch);
        setEditingId(null);
    };

    const renderContent = ({ attrs, original }: CorrectionItem) => {
        switch (attrs.type) {
            case "REPLACE":
                return (
                    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        <span className={ORIGINAL_CLASS}>{original}</span>
                        <span className="text-muted">→</span>
                        <span className={NEW_TEXT_CLASS}>{attrs.text}</span>
                    </p>
                );
            case "DELETE":
                return (
                    <p>
                        <span className={ORIGINAL_CLASS}>{original}</span>
                    </p>
                );
            case "INSERT":
                return (
                    <p>
                        <span className={NEW_TEXT_CLASS}>+ {attrs.text}</span>
                    </p>
                );
            case "COMMENT":
                return <p className={QUOTE_CLASS}>“{original}”</p>;
        }
    };

    const renderCard = (item: CorrectionItem) => {
        const style = CRITERION_STYLES[item.attrs.criterion];
        const isEditing = editingId === item.attrs.id;

        return (
            <div className={CARD_CLASS}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className={`${NUMBER_BADGE_CLASS} ${style?.badge ?? BADGE_FALLBACK_CLASS}`}>
                            {item.index + 1}
                        </span>
                        <span className={`${CRITERION_TAG_CLASS} ${style?.active ?? ""}`}>
                            {item.attrs.criterion}
                        </span>
                        <span className="truncate text-sm text-muted">{t(`types.${item.attrs.type}`)}</span>
                    </div>

                    {showHeaderActions && !isEditing && (
                        <div className="flex shrink-0 items-center gap-1.5">
                            {canEdit && (
                                <Button
                                    label=""
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={<PencilIcon width={16} height={16} />}
                                    iconOnly={true}
                                    onClick={() => setEditingId(item.attrs.id)}
                                />
                            )}

                            {canModify && (
                                <Popconfirm
                                    title={t("deletePopconfirm.title")}
                                    description={t("deletePopconfirm.subtitle")}
                                    placement="bottomRight"
                                    okText={t("deletePopconfirm.okText")}
                                    cancelText={t("deletePopconfirm.cancelText")}
                                    cancelButtonProps={{ style: { cursor: "pointer" } }}
                                    onConfirm={() => handleRemove(item.attrs.id)}
                                >
                                    <button type="button" className={DELETE_BUTTON_CLASS}>
                                        <TrashIcon width={16} height={16} />
                                    </button>
                                </Popconfirm>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <CorrectionEditForm
                        key={item.attrs.id}
                        attrs={item.attrs}
                        original={item.original}
                        onSave={(patch) => handleUpdate(item.attrs.id, patch)}
                        onCancel={() => setEditingId(null)}
                    />
                ) : (
                    <>
                        <div className="text-sm">{renderContent(item)}</div>

                        {item.attrs.description && (
                            <p className="text-sm text-fg/80">{item.attrs.description}</p>
                        )}

                        {canModify && (
                            <div className="mt-1 flex justify-end">
                                <Button
                                    label={t("apply")}
                                    type="button"
                                    variant="tertiary"
                                    size="sm"
                                    onClick={() => handleApply(item.attrs.id)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            <p className="font-semibold text-fg">{t("title")}</p>

            <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((item) => {
                    const active = item === filter;
                    const style = item === "ALL" ? null : CRITERION_STYLES[item];

                    const stateClass = active
                        ? style?.active ?? CHIP_ALL_ACTIVE_CLASS
                        : `${CHIP_INACTIVE_CLASS} ${style?.hover ?? CHIP_ALL_HOVER_CLASS}`;

                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={`${CHIP_BASE_CLASS} ${stateClass}`}
                        >
                            {style && <span className={`size-2 rounded-full ${style.badge}`} />}
                            <span>{item === "ALL" ? t("all") : item}</span>
                            <span className={COUNT_CLASS}>{countOf(item)}</span>
                        </button>
                    );
                })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {visible.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">{t("empty")}</p>
                ) : (
                    <Listy<CorrectionItem>
                        items={visible}
                        rowKey={(item) => item.attrs.id}
                        styles={LISTY_STYLES}
                        itemRender={renderCard}
                    />
                )}
            </div>

            {canModify && visible.length > 0 && (
                <div className="flex items-center justify-end gap-1.5 border-t border-border pt-3">
                    <Popconfirm
                        title={t("applyAllPopconfirm.title")}
                        description={t("applyAllPopconfirm.subtitle", { count: visible.length })}
                        placement="topRight"
                        okText={t("applyAllPopconfirm.okText")}
                        cancelText={t("deletePopconfirm.cancelText")}
                        cancelButtonProps={{ style: { cursor: "pointer" } }}
                        onConfirm={handleApplyAll}
                    >
                        <span>
                            <Button label={t("applyAll")} type="button" variant="tertiary" size="sm" />
                        </span>
                    </Popconfirm>

                    <Popconfirm
                        title={t("deleteAllPopconfirm.title")}
                        description={t("deleteAllPopconfirm.subtitle", { count: visible.length })}
                        placement="topRight"
                        okText={t("deletePopconfirm.okText")}
                        cancelText={t("deletePopconfirm.cancelText")}
                        cancelButtonProps={{ style: { cursor: "pointer" } }}
                        onConfirm={handleRemoveAll}
                    >
                        <span>
                            <Button label={t("deleteAll")} type="button" variant="secondary" size="sm" />
                        </span>
                    </Popconfirm>
                </div>
            )}
        </div>
    );
}