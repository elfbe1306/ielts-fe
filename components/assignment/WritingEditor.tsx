import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder, Selection as BlurSelection } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Popover, Spin, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import CorrectionMenu from "./CorrectionMenu";
import { CorrectionMark } from "./CorrectionMark";

type Format = "bold" | "italic" | "underline" | "strike";

type SaveStatus = "saving" | "saved";

type Connection = {
    doc: Y.Doc;
    provider: HocuspocusProvider;
};

type CurrentUser = {
    id: string;
    name: string;
};

const COLLAB_URL = process.env.NEXT_PUBLIC_COLLAB_URL ?? "ws://localhost:1234";

const BUBBLE_MENU_KEY = "correctionBubbleMenu";

const FORMATS: { format: Format; label: string; className: string }[] = [
    { format: "bold", label: "B", className: "font-bold" },
    { format: "italic", label: "I", className: "italic" },
    { format: "underline", label: "U", className: "underline" },
    { format: "strike", label: "S", className: "line-through" },
];

const COLORS: (string | null)[] = [null, "#ff4d4f", "#2a4fa8", "#237804", "#d97706", "#ffc200"];

const CARET_COLORS = ["#d4380d", "#1677ff", "#389e0d", "#c41d7f", "#531dab", "#d48806", "#08979c", "#cf1322"];

const DEFAULT_TEXT_COLOR = "var(--color-fg)";

const BUTTON_BASE_CLASS = "flex size-8 items-center justify-center rounded-md text-base transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_ACTIVE_CLASS = "bg-highlight text-fg hover:bg-highlight-hover";
const BUTTON_INACTIVE_CLASS = "text-fg hover:bg-highlight-bg hover:text-highlight-fg hover:inset-ring hover:inset-ring-highlight/60 active:bg-highlight/40";
const BUTTON_OPEN_CLASS = "bg-highlight-bg text-fg inset-ring inset-ring-highlight/60";

const SWATCH_BASE_CLASS = "flex size-8 items-center justify-center rounded-md transition-colors";
const SWATCH_ACTIVE_CLASS = "bg-highlight-bg inset-ring-2 inset-ring-highlight";
const SWATCH_INACTIVE_CLASS = "hover:bg-highlight-bg";

const EDITOR_CLASS = [
    "flex-1 p-5 leading-relaxed text-fg outline-none",
    "selection:bg-highlight/40",
    "[&_p+p]:mt-2",
    "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
    "[&_p.is-editor-empty:first-child::before]:text-muted/70",
    "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
    "[&_p.is-editor-empty:first-child::before]:float-left",
    "[&_p.is-editor-empty:first-child::before]:h-0",
].join(" ");

function countWords(editor: Editor): number {
    const { doc } = editor.state;
    const text = doc.textBetween(0, doc.content.size, " ", " ");
    return text.match(/\S+/g)?.length ?? 0;
}

function pickCaretColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    }
    return CARET_COLORS[hash % CARET_COLORS.length];
}

// ===== Bọc ngoài: tạo Y.Doc + provider, chờ sync xong mới hiện editor =====

type WritingEditorProps = {
    documentName: string;
    currentUser: CurrentUser;
    readOnly?: boolean;
    isCorrection?: boolean;
    onEditorChange?: (editor: Editor | null) => void;
};

export default function WritingEditor({
    documentName,
    currentUser,
    readOnly = false,
    isCorrection = false,
    onEditorChange
}: WritingEditorProps) {
    const [connection, setConnection] = useState<Connection | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

    useEffect(() => {
        const doc = new Y.Doc();

        const provider = new HocuspocusProvider({
            url: COLLAB_URL,
            name: documentName,
            document: doc,
            onSynced: () => {
                setConnection((prev) => {
                    if (prev !== null) return prev;
                    return { doc, provider };
                });
            },
            onStateless: ({ payload }) => {
                try {
                    const message = JSON.parse(payload);
                    if (message.type === "saved") setSaveStatus("saved");
                } catch {
                    // tin nhắn không phải JSON → bỏ qua
                }
            },
        });

        const handleUpdate = (_update: Uint8Array, origin: unknown) => {
            if (origin !== provider) setSaveStatus("saving");
        };

        doc.on("update", handleUpdate);

        return () => {
            doc.off("update", handleUpdate);
            provider.destroy();
            doc.destroy();
        };
    }, [documentName]);

    if (!connection) {
        return <div className="flex min-h-180 flex-1 animate-pulse border border-border bg-surface" />;
    }

    return (
        <EditorBody
            doc={connection.doc}
            provider={connection.provider}
            currentUser={currentUser}
            readOnly={readOnly}
            isCorrection={isCorrection}
            saveStatus={saveStatus}
            onEditorChange={onEditorChange}
        />
    );
}

// ===== Bên trong: editor =====

type EditorBodyProps = {
    doc: Y.Doc;
    provider: HocuspocusProvider;
    currentUser: CurrentUser;
    readOnly: boolean;
    isCorrection: boolean;
    saveStatus: SaveStatus;
    onEditorChange?: (editor: Editor | null) => void;
};

function EditorBody({ doc, provider, currentUser, readOnly, isCorrection, saveStatus, onEditorChange }: EditorBodyProps) {
    const t = useTranslations("writingWorkspace.writingEditor");

    const [isColorOpen, setIsColorOpen] = useState<boolean>(false);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);

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
            Placeholder.configure({ placeholder: t("placeholder") }),
            BlurSelection.configure({ className: "bg-highlight/40" }),
            TextStyle,
            Color,
            CorrectionMark,
            Collaboration.configure({ document: doc }),
            CollaborationCaret.configure({
                provider,
                user: {
                    name: currentUser.name,
                    color: pickCaretColor(currentUser.id),
                },
            }),
        ],
        editable: !readOnly,
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
        editor.setEditable(!readOnly);
    }, [editor, readOnly]);

    useEffect(() => {
        if (!onEditorChange) return;
        onEditorChange(editor);
        return () => onEditorChange(null);
    }, [editor, onEditorChange]);

    useEffect(() => {
        if (!editor || editor.isDestroyed || isSelecting || !isCorrection) return;
        editor.commands.setMeta(BUBBLE_MENU_KEY, "updatePosition");
    }, [editor, isSelecting, isCorrection]);

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
    const isToolbarDisabled = !editor || readOnly;

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
            <div className="flex items-center gap-1 border-b border-border bg-surface px-3 py-2">
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
                    open={isColorOpen && !readOnly}
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

                    {!readOnly && (
                        <span className={`flex items-center gap-1.5 ${saveStatus === "saving" ? "text-accent" : "text-success"}`}>
                            {saveStatus === "saving" ? (
                                <>
                                    <Spin size="small" />
                                    {t("saveStatus.saving")}
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon width={14} height={14} />
                                    {t("saveStatus.saved")}
                                </>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {editor && isCorrection && (
                <BubbleMenu
                    editor={editor}
                    pluginKey={BUBBLE_MENU_KEY}
                    options={{ placement: "bottom", offset: 8 }}
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