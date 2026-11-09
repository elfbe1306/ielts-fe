import Collaboration from "@tiptap/extension-collaboration";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, posToDOMRect, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { CorrectionMark } from "./CorrectionMark";
import { useTranslations } from "next-intl";
import { Popover, Tooltip } from "antd";
import { BubbleMenu } from "@tiptap/react/menus";
import CorrectionMenu from "./CorrectionMenu";

const EDITOR_CLASS = "flex-1 p-5 leading-relaxed text-fg outline-none [&_p+p]:mt-2";

const BUBBLE_MENU_KEY = "attemptBubbleMenu";

type Format = "bold" | "italic" | "underline" | "strike";

const FORMATS: { format: Format; label: string; className: string }[] = [
    { format: "bold", label: "B", className: "font-bold" },
    { format: "italic", label: "I", className: "italic" },
    { format: "underline", label: "U", className: "underline" },
    { format: "strike", label: "S", className: "line-through" },
];

const COLORS: (string | null)[] = [null, "#ff4d4f", "#2a4fa8", "#237804", "#d97706", "#ffc200"];

const DEFAULT_TEXT_COLOR = "var(--color-fg)";

const BUTTON_BASE_CLASS = "flex size-8 items-center justify-center rounded-md text-base transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_ACTIVE_CLASS = "bg-highlight text-fg hover:bg-highlight-hover";
const BUTTON_INACTIVE_CLASS = "text-fg hover:bg-highlight-bg hover:text-highlight-fg hover:inset-ring hover:inset-ring-highlight/60 active:bg-highlight/40";
const BUTTON_OPEN_CLASS = "bg-highlight-bg text-fg inset-ring inset-ring-highlight/60";

const SWATCH_BASE_CLASS = "flex size-8 items-center justify-center rounded-md transition-colors";
const SWATCH_ACTIVE_CLASS = "bg-highlight-bg inset-ring-2 inset-ring-highlight";
const SWATCH_INACTIVE_CLASS = "hover:bg-highlight-bg";

function countWords(editor: Editor): number {
    const { doc } = editor.state;
    const text = doc.textBetween(0, doc.content.size, " ", " ");
    return text.match(/\S+/g)?.length ?? 0;
}

type AttemptViewerProps = {
    content: string;
    editable?: boolean;
    onEditorChange?: (editor: Editor | null) => void;
};

export default function AttemptViewer({ content, editable = false, onEditorChange }: AttemptViewerProps) {
    const t = useTranslations("writingWorkspace.attemptViewer");

    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [isColorOpen, setIsColorOpen] = useState<boolean>(false);

    const [doc] = useState(() => {
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, Uint8Array.from(atob(content), (c) => c.charCodeAt(0)));
        return ydoc;
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                blockquote: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
                listKeymap: false,
                codeBlock: false,
                code: false,
                horizontalRule: false,
                link: false,
                undoRedo: false,
            }),
            TextStyle,
            Color,
            CorrectionMark,
            Collaboration.configure({ document: doc }),
        ],
        editable,
        immediatelyRender: false,
        enableInputRules: false,
        enablePasteRules: false,
        editorProps: {
            attributes: { class: EDITOR_CLASS },
            handleDOMEvents: {
                mousedown: (_view, event) => {
                    if (event.button !== 0) return false;
                    setIsSelecting(true);
                    document.addEventListener("mouseup", () => setIsSelecting(false), { once: true });
                    return false;
                },
            },
        },
    });

    useEffect(() => {
        if (!editor || editor.isDestroyed) return;
        editor.setEditable(editable);
    }, [editor, editable]);

    useEffect(() => {
        if (!onEditorChange) return;
        onEditorChange(editor);
        return () => onEditorChange(null);
    }, [editor, onEditorChange]);

    useEffect(() => {
        if (!editor || editor.isDestroyed || isSelecting || !editable) return;
        editor.commands.setMeta(BUBBLE_MENU_KEY, "updatePosition");
    }, [editor, isSelecting, editable]);

    const editorState = useEditorState({
        editor,
        selector: ({ editor }) => ({
            bold: editor?.isActive("bold") ?? false,
            italic: editor?.isActive("italic") ?? false,
            underline: editor?.isActive("underline") ?? false,
            strike: editor?.isActive("strike") ?? false,
            color: (editor?.getAttributes("textStyle").color as string | undefined) ?? null,
            words: editor ? countWords(editor) : 0,
        }),
    });

    const currentColor = editorState?.color ?? null;
    const wordCount = editorState?.words ?? 0;
    const isToolbarDisabled = !editor || !editable;

    const applyColor = (value: string | null) => {
        if (!editor) return;
        if (value) editor.chain().focus().setColor(value).run();
        else editor.chain().focus().unsetColor().run();
        setIsColorOpen(false);
    };

    const colorPalette = (
        <div className="flex items-center gap-1">
            {COLORS.map((value) => (
                <button
                    key={value ?? "default"}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyColor(value)}
                    className={`${SWATCH_BASE_CLASS} ${currentColor === value ? SWATCH_ACTIVE_CLASS : SWATCH_INACTIVE_CLASS}`}
                >
                    <span className="size-5 rounded-full" style={{ backgroundColor: value ?? DEFAULT_TEXT_COLOR }} />
                </button>
            ))}
        </div>
    );

    return (
        <div className="flex min-h-180 flex-1 flex-col border border-border">
            <div className="flex min-h-12 items-center gap-1 border-b border-border bg-surface px-3 py-2">
                {FORMATS.map(({ format, label, className }) => {
                    const isActive = editorState?.[format] ?? false;

                    return (
                        <Tooltip key={format} title={t(`formats.${format}`)} placement="top">
                            <button
                                type="button"
                                disabled={isToolbarDisabled}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => editor?.chain().focus().toggleMark(format).run()}
                                className={`${BUTTON_BASE_CLASS} ${className} ${isActive ? BUTTON_ACTIVE_CLASS : BUTTON_INACTIVE_CLASS}`}
                            >
                                {label}
                            </button>
                        </Tooltip>
                    );
                })}

                <Popover
                    content={colorPalette}
                    trigger="click"
                    placement="bottomLeft"
                    open={isColorOpen && editable}
                    onOpenChange={setIsColorOpen}
                >
                    <button
                        type="button"
                        disabled={isToolbarDisabled}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`${BUTTON_BASE_CLASS} flex-col gap-0.5 ${isColorOpen ? BUTTON_OPEN_CLASS : BUTTON_INACTIVE_CLASS}`}
                    >
                        <span className="text-sm font-semibold leading-none">A</span>
                        <span className="h-1 w-4 rounded-sm" style={{ backgroundColor: currentColor ?? DEFAULT_TEXT_COLOR }} />
                    </button>
                </Popover>

                <div className="ml-auto flex items-center gap-4 text-sm">
                    <span className="tabular-nums text-muted">{t("wordCount", { count: wordCount })}</span>
                </div>
            </div>

            {editor && editable && (
                <BubbleMenu
                    editor={editor}
                    pluginKey={BUBBLE_MENU_KEY}
                    getReferencedVirtualElement={() => {
                        const { to } = editor.state.selection;
                        return {
                            getBoundingClientRect: () => posToDOMRect(editor.view, to, to),
                            getClientRects: () => [posToDOMRect(editor.view, to, to)],
                        };
                    }}
                    options={{ placement: "bottom", offset: 8, flip: false, shift: { padding: 8 } }}
                    className="z-50"
                >
                    {!isSelecting && (
                        <div className="rounded-lg border border-border bg-bg shadow-lg">
                            <CorrectionMenu editor={editor} />
                        </div>
                    )}
                </BubbleMenu>
            )}
 
            <EditorContent editor={editor} className="flex flex-1 flex-col" />
        </div>
    );
}