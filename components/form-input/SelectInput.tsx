import { Select } from "antd";

export type SelectOption<T extends string = string> = {
    value: T;
    label: string;
};

type SelectInputProps<T extends string> = {
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    options: SelectOption<T>[];
    value: T | "";
    onChange: (value: T) => void;
}

export default function SelectInput<T extends string = string>(props: SelectInputProps<T>) {
    const { label, placeholder, error, disabled = false, options, value, onChange } = props;

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <p className="text-sm font-medium text-fg">{label}</p>
            )}

            <Select<T>
                size="large"
                className="w-full"
                value={value === "" ? undefined : value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                disabled={disabled}
                status={error ? "error" : undefined}
            />

            {error && <span className="text-sm text-error">{error}</span>}
        </div>
    )
}