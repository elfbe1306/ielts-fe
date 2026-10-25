import { useState } from "react";
import EyeOffIcon from "../icons/EyeOffIcon";
import EyeOnIcon from "../icons/EyeOnIcon";

type TextInputSize = "sm" | "md";

type BaseProps = {
    label?: string;
    placeholder?: string;
    error?: string;
    rightSlot?: React.ReactNode;
    maxLength?: number;
    rows?: number;
    size?: TextInputSize;
};

type StringTextInputProps = BaseProps & {
    type?: "text" | "email" | "password" | "textarea";
    value: string;
    onChange: (value: string) => void;
};

type NumberTextInputProps = BaseProps & {
    type: "number";
    value: number | "";
    onChange: (value: number | "") => void;
};

type TextInputProps = StringTextInputProps | NumberTextInputProps;

const SIZE_STYLES: Record<TextInputSize, { field: string; input: string; textarea: string; label: string; passwordInput: string; eyeButton: string; eyeIcon: number }> = {
    md: {
        field: "px-3.5 text-base",
        input: "h-11",
        textarea: "py-3",
        label: "text-sm",
        passwordInput: "pr-11",
        eyeButton: "right-1 top-1 h-9 w-9",
        eyeIcon: 19,
    },
    sm: {
        field: "px-3 text-sm",
        input: "h-9",
        textarea: "py-2",
        label: "text-xs",
        passwordInput: "pr-9",
        eyeButton: "right-1 top-1 h-7 w-7",
        eyeIcon: 16,
    },
};

export default function TextInput(props: TextInputProps) {
    const { label, placeholder, error, rightSlot, maxLength, rows = 6, type = "text", size = "md" } = props;
    const isPassword = type === "password";
    const isTextarea = type === "textarea";
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const sizeStyle = SIZE_STYLES[size];

    const handleChange = (raw: string) => {
        if (props.type === "number") {
            props.onChange(raw === "" ? "" : Number(raw));
        } else {
            props.onChange(raw);
        }
    };

    const baseClass = `w-full rounded-lg border border-border text-fg outline-none transition-colors placeholder:text-muted placeholder:text-sm focus:border-accent focus:ring-3 focus:ring-accent-bg
        ${sizeStyle.field}
        ${error ? "border-error focus:ring-error-bg" : "border-border"}
    `;

    return (
        <div className="flex flex-col gap-1.5">
            {(label || rightSlot) && (
                <div className="flex items-baseline justify-between">
                    {label && <p className={`${sizeStyle.label} font-medium text-fg`}>{label}</p>}
                    {rightSlot}
                </div>
            )}

            <div className="relative">
                {isTextarea ? (
                    <textarea
                        value={props.value}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        rows={rows}
                        className={`${baseClass} ${sizeStyle.textarea} resize-y`}
                    />
                ) : (
                    <input
                        type={isPassword && showPassword ? "text" : type}
                        value={props.value}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={`${baseClass} ${sizeStyle.input} ${isPassword ? sizeStyle.passwordInput : ""}`}
                    />
                )}

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className={`absolute flex items-center justify-center rounded-md hover:bg-surface hover:text-fg ${sizeStyle.eyeButton}`}
                    >
                        {showPassword ? (
                            <EyeOffIcon className="text-muted" width={sizeStyle.eyeIcon} height={sizeStyle.eyeIcon} />
                        ) : (
                            <EyeOnIcon className="text-muted" width={sizeStyle.eyeIcon} height={sizeStyle.eyeIcon} />
                        )}
                    </button>
                )}
            </div>

            {error && <span className="text-sm text-error">{error}</span>}
        </div>
    );
}