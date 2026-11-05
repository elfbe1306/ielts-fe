import { AiCorrection, CorrectionAttrs } from "@/types/writing-correction-type";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";

export const CORRECTION_MARK_NAME = "correction";

const BLOCK_SEPARATOR = "\n\n";
const NO_POS = -1;

type TextIndex = {
    text: string;
    positions: number[];
};

export function buildTextIndex(doc: ProseMirrorNode): TextIndex {
    let text = "";
    const positions: number[] = [];
    let isFirstBlock = true;

    const pushSeparator = (separator: string) => {
        text += separator;
        for (let i = 0; i < separator.length; i++) positions.push(NO_POS);
    };

    doc.descendants((node, pos) => {
        if (node.isTextblock) {
            if (!isFirstBlock) pushSeparator(BLOCK_SEPARATOR);
            isFirstBlock = false;
            return true;
        }

        if (node.isText && node.text) {
            text += node.text;
            for (let i = 0; i < node.text.length; i++) positions.push(pos + i);
            return false;
        }

        if (node.type.name === "hardBreak") {
            pushSeparator("\n");
            return false;
        }

        return true;
    });

    return { text, positions };
}

function locate(text: string, context: string, quote: string): [number, number] | null {
    if (!quote) return null;

    if (context) {
        const contextStart = text.indexOf(context);
        if (contextStart !== -1) {
            const offset = context.indexOf(quote);
            if (offset !== -1) {
                const start = contextStart + offset;
                return [start, start + quote.length];
            }
        }
    }

    const first = text.indexOf(quote);
    if (first === -1 || text.indexOf(quote, first + 1) !== -1) return null;
    return [first, first + quote.length];
}

export function applyAiCorrections(editor: Editor, corrections: AiCorrection[]) {
    const markType = editor.schema.marks[CORRECTION_MARK_NAME];
    if (!markType) {
        throw new Error(`Mark "${CORRECTION_MARK_NAME}" không tồn tại trong schema`);
    }

    const { text, positions } = buildTextIndex(editor.state.doc);
    const tr = editor.state.tr;
    let applied = 0;

    for (const correction of corrections) {
        const range = locate(text, correction.context, correction.quote);
        if (!range) continue;

        const from = positions[range[0]];
        const last = positions[range[1] - 1];
        if (from === NO_POS || last === NO_POS) continue;

        const attrs: CorrectionAttrs = {
            id: crypto.randomUUID(),
            type: correction.type,
            criterion: correction.criterion,
            text: correction.text,
            description: correction.description,
        };

        tr.addMark(from, last + 1, markType.create(attrs));
        applied++;
    }

    if (applied > 0) editor.view.dispatch(tr);

    return { applied, skipped: corrections.length - applied };
}

export function countPendingCorrections(doc: ProseMirrorNode): number {
    const ids = new Set<string>();
    doc.descendants((node) => {
        for (const mark of node.marks) {
            if (mark.type.name === CORRECTION_MARK_NAME && mark.attrs.id) {
                ids.add(mark.attrs.id);
            }
        }
    });
    return ids.size;
}