// Convert YYYY-MM-DD to DD-MM-YYYY
export function formatDateDDMMYYYY(dateStr: string): string {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
}

// Convert YYYY-MM-DD to DD/MM
export function formatDayMonth(dateStr: string): string {
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
}

// Parse YYYY-MM-DD as local date (avoid UTC shift of new Date("YYYY-MM-DD"))
export function parseLocalDate(dateStr: string): Date {
    return new Date(`${dateStr}T00:00:00`);
}

// Convert "HH:mm:ss" or "HH:mm" to "HH:mm"
export function formatTime(timeStr: string): string {
    return timeStr.slice(0, 5);
}

// Convert ISO Instant string to "DD-MM-YYYY HH:mm:ss"
export function formatInstant(instantStr: string): string {
    const date = new Date(instantStr);

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid Instant string: ${instantStr}`);
    }

    const pad = (n: number) => n.toString().padStart(2, "0");

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Today as YYYY-MM-DD in local time
export function todayIso(): string {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${m}-${d}`;
}

// Add days to YYYY-MM-DD, returns YYYY-MM-DD (local time)
export function addDays(dateStr: string, days: number): string {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + days);

    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

// True if the deadline has passed (local time).
export function isOverdue(dateStr: string, timeStr: string): boolean {
    if (!timeStr) return dateStr < todayIso();

    return new Date(`${dateStr}T${timeStr}`).getTime() < Date.now();
}