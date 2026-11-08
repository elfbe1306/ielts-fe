import Collaboration from "@tiptap/extension-collaboration";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import * as Y from "yjs";
import { CorrectionMark } from "./CorrectionMark";

const EDITOR_CLASS = "flex-1 p-5 leading-relaxed text-fg outline-none [&_p+p]:mt-2";

type AttemptViewerProps = {
    content: string;
};

export default function AttemptViewer({ content }: AttemptViewerProps) {
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
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: { class: EDITOR_CLASS },
        },
    });

    return (
        <div className="flex min-h-180 flex-1 flex-col border border-border">
            <EditorContent editor={editor} className="flex flex-1 flex-col" />
        </div>
    );
}