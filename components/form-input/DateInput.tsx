import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const DISPLAY_FORMAT = "DD-MM-YYYY";
const VALUE_FORMAT = "YYYY-MM-DD";

type DateInputProps = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

export default function DateInput({ label, value, onChange, error } : DateInputProps) {
    const parsed = value ? dayjs(value, VALUE_FORMAT, true) : null;
    const dateValue = parsed?.isValid() ? parsed : null;

    const handleChange = (date: Dayjs | null) => {
        onChange(date ? date.format(VALUE_FORMAT) : "");
    };

    return (
        <div className="flex flex-col gap-1.5">
            {label && <p className="text-sm font-medium text-fg">{label}</p>}

            <DatePicker
                value={dateValue}
                onChange={handleChange}
                format={DISPLAY_FORMAT}
                placeholder="dd-mm-yyyy"
                style={{ padding: "10px" }}
            />

            {error && <span className="text-sm text-error">{error}</span>}
        </div>
    );
}