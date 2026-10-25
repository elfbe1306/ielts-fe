import { useEffect } from "react";
import CloseIcon from "../icons/CloseIcon";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const SIZE_CLASS: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl"
}

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    size?: ModalSize;
    centerTitle?: boolean;
    children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, subtitle, size = "lg", centerTitle = false, children } : ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);

        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;

        document.body.style.overflow = "hidden";
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPaddingRight;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 p-6">
            <div className={`flex w-full ${SIZE_CLASS[size]} max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-bg`}>
                {/* Header */}
                <div className="shrink-0 px-7 pt-7 pb-5">
                    <div className={`relative flex items-center mb-1 ${centerTitle ? "justify-center" : "justify-between gap-3"}`}>
                        <p className={`font-serif font-bold text-xl text-fg ${centerTitle ? "text-center px-8" : ""}`}>{title}</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`rounded-md p-1.5 text-muted hover:bg-surface hover:text-fg ${centerTitle ? "absolute right-0 top-1/2 -translate-y-1/2" : ""}`}
                        >
                            <CloseIcon width={20} height={20}/>
                        </button>
                    </div>
                    {subtitle && <p className={`text-muted text-sm ${centerTitle ? "text-center" : ""}`}>{subtitle}</p>}
                </div>

                {/* Body */}
                <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7">
                    {children}
                </div>
            </div>
        </div>
    );
}