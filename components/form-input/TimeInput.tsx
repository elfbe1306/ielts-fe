import { TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const FORMAT = "HH:mm";

type TimeInputProps = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function TimeInput({ label, value, onChange, error } : TimeInputProps) {
    const parsed = value ? dayjs(value, FORMAT, true) : null;
    const timeValue = parsed?.isValid() ? parsed : null;

    const handleChange = (time: Dayjs | null) => {
        onChange(time ? time.format(FORMAT) : "");
    };

    return (
        <div className="flex flex-col gap-1.5">
            {label && <p className="text-sm font-medium text-fg">{label}</p>}

            <TimePicker
                value={timeValue}
                onChange={handleChange}
                format={FORMAT}
                needConfirm={false}
                placeholder="hh:mm"
                style={{ padding: "10px", width: "100%" }}
            />

            {error && <span className="text-sm text-error">{error}</span>}
        </div>
    );
}