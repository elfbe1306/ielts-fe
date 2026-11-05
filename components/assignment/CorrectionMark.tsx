import { CorrectionAttrs, CorrectionRange } from "@/types/writing-correction-type";
import { CorrectionType, CRITERION_STYLES } from "@/types/writing-criterion-type";
import { Mark, mergeAttributes } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        correction: {
            addCorrection: (range: { from: number; to: number }, attrs: CorrectionAttrs) => ReturnType;
            removeCorrection: (id: string) => ReturnType;
            applyCorrection: (id: string) => ReturnType;
            updateCorrection: (
                id: string,
                patch: Pick<CorrectionAttrs, "criterion" | "text" | "description">
            ) => ReturnType;
        };
    }
}

const MARK_CLASS: Record<CorrectionType, string> = {
    REPLACE: "text-error line-through decoration-error",
    DELETE: "text-error line-through decoration-error",
    INSERT: "",
    COMMENT: "rounded-sm bg-yellow-300/40 underline decoration-2 decoration-highlight underline-offset-4",
};

const BADGE_BASE_CLASS = "relative -top-2 ml-0.5 inline-flex size-4 select-none items-center justify-center rounded-full text-[10px] font-semibold leading-none";
const BADGE_FALLBACK_CLASS = "bg-fg text-bg";
const REPLACE_TEXT_CLASS = "ml-1 rounded-sm bg-success-bg px-1 text-success";
const INSERT_TEXT_CLASS = "mx-0.5 rounded-r-sm border-l-2 border-success bg-success-bg px-1 text-success";

const LEADING_PUNCTUATION = /^[,.;:!?)\]]/;

const correctionWidgetsKey = new PluginKey<DecorationSet>("correctionWidgets");

const dataAttribute = (name: keyof CorrectionAttrs, fallback: string | null = "") => ({
    default: fallback,
    parseHTML: (element: HTMLElement) => element.getAttribute(`data-${name}`) ?? fallback,
    renderHTML: (attributes: Record<string, unknown>) => ({ [`data-${name}`]: attributes[name] }),
});

export function collectCorrections(doc: ProseMirrorNode, markName: string): CorrectionRange[] {
    const ranges = new Map<string, CorrectionRange>();

    doc.descendants((node, pos) => {
        if (!node.isText) return;

        for (const mark of node.marks) {
            if (mark.type.name !== markName) continue;

            const attrs = mark.attrs as CorrectionAttrs;
            const end = pos + node.nodeSize;
            const existing = ranges.get(attrs.id);

            if (existing) {
                existing.from = Math.min(existing.from, pos);
                existing.to = Math.max(existing.to, end);
            } else {
                ranges.set(attrs.id, { from: pos, to: end, attrs });
            }
        }
    });

    return [...ranges.values()].sort((a, b) => a.from - b.from || a.to - b.to);
}

function createWidget({ attrs }: CorrectionRange, index: number): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.contentEditable = "false";
    wrapper.dataset.correctionWidget = attrs.id;

    if ((attrs.type === "REPLACE" || attrs.type === "INSERT") && attrs.text) {
        const newText = document.createElement("span");
        newText.className = attrs.type === "INSERT" ? INSERT_TEXT_CLASS : REPLACE_TEXT_CLASS;
        newText.textContent = attrs.text;
        wrapper.appendChild(newText);
    }

    const badge = document.createElement("span");
    const colorClass = CRITERION_STYLES[attrs.criterion]?.badge ?? BADGE_FALLBACK_CLASS;
    badge.className = `${BADGE_BASE_CLASS} ${colorClass}`;
    badge.title = attrs.criterion;
    badge.textContent = String(index + 1);
    wrapper.appendChild(badge);

    return wrapper;
}

function buildDecorations(doc: ProseMirrorNode, markName: string): DecorationSet {
    const decorations = collectCorrections(doc, markName).map((range, index) =>
        Decoration.widget(range.to, () => createWidget(range, index), {
            side: 1,
            ignoreSelection: true,
            key: `${range.attrs.id}:${index}:${range.attrs.criterion}:${range.attrs.text}`,
        })
    );

    return DecorationSet.create(doc, decorations);
}

export const CorrectionMark = Mark.create({
    name: "correction",

    inclusive: false,

    excludes: "",

    addAttributes() {
        return {
            id: dataAttribute("id", null),
            type: dataAttribute("type", "comment"),
            criterion: dataAttribute("criterion", "GRA"),
            text: dataAttribute("text"),
            description: dataAttribute("description"),
        };
    },

    parseHTML() {
        return [{ tag: "span[data-correction]" }];
    },

    renderHTML({ mark, HTMLAttributes }) {
        return [
            "span",
            mergeAttributes(HTMLAttributes, {
                "data-correction": "",
                class: MARK_CLASS[mark.attrs.type as CorrectionType] ?? "",
            }),
            0,
        ];
    },

    addCommands() {
        return {
            addCorrection:
                (range, attrs) =>
                ({ tr, dispatch }) => {
                    if (range.from >= range.to) return false;
                    if (dispatch) tr.addMark(range.from, range.to, this.type.create(attrs));
                    return true;
                },

            removeCorrection:
                (id) =>
                ({ tr, dispatch }) => {
                    const range = collectCorrections(tr.doc, this.name).find((item) => item.attrs.id === id);
                    if (!range) return false;
                    if (dispatch) tr.removeMark(range.from, range.to, this.type.create(range.attrs));
                    return true;
                },

            updateCorrection:
                (id, patch) =>
                ({ tr, dispatch }) => {
                    const range = collectCorrections(tr.doc, this.name).find((item) => item.attrs.id === id);
                    if (!range) return false;

                    if (dispatch) {
                        const next: CorrectionAttrs = {
                            ...range.attrs,
                            ...patch,
                            id: range.attrs.id,
                            type: range.attrs.type,
                        };

                        tr.removeMark(range.from, range.to, this.type.create(range.attrs));
                        tr.addMark(range.from, range.to, this.type.create(next));
                    }

                    return true;
                },
            
            applyCorrection:
                (id) =>
                ({ tr, dispatch }) => {
                    const range = collectCorrections(tr.doc, this.name).find((item) => item.attrs.id === id);
                    if (!range) return false;

                    const { from, to, attrs } = range;
                    const mark = this.type.create(attrs);

                    if ((attrs.type === "REPLACE" || attrs.type === "INSERT") && !attrs.text) return false;
                    if (!dispatch) return true;

                    switch (attrs.type) {
                        case "COMMENT": {
                            tr.removeMark(from, to, mark);
                            break;
                        }

                        case "REPLACE": {
                            tr.insertText(attrs.text, from, to);
                            tr.removeMark(from, from + attrs.text.length, mark);
                            break;
                        }

                        case "DELETE": {
                            const before = tr.doc.textBetween(Math.max(0, from - 1), from);
                            const after = tr.doc.textBetween(to, Math.min(tr.doc.content.size, to + 1));

                            let start = from;
                            let end = to;

                            if (after === " " && (before === " " || before === "")) {
                                end = to + 1;
                            } else if (before === " " && (after === "" || LEADING_PUNCTUATION.test(after))) {
                                start = from - 1; 
                            }

                            tr.delete(start, end);
                            break;
                        }

                        case "INSERT": {
                            tr.removeMark(from, to, mark);

                            const previous = tr.doc.textBetween(to - 1, to);
                            const needsSpace = previous !== " " && !LEADING_PUNCTUATION.test(attrs.text);
                            const text = needsSpace ? ` ${attrs.text}` : attrs.text;

                            tr.insertText(text, to);
                            tr.removeMark(to, to + text.length, mark);
                            break;
                        }
                    }

                    return true;
                },
        };
    },

    addProseMirrorPlugins() {
        const markName = this.name;

        return [
            new Plugin<DecorationSet>({
                key: correctionWidgetsKey,
                state: {
                    init: (_, state) => buildDecorations(state.doc, markName),
                    apply: (tr, old) => (tr.docChanged ? buildDecorations(tr.doc, markName) : old),
                },
                props: {
                    decorations: (state) => correctionWidgetsKey.getState(state),
                },
            }),
        ];
    },
});