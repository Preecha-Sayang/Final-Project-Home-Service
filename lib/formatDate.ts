export function formatThaiDateTimeAMPM(input: string | number | Date) {
    const d = toDateAssumeUTCIfNaive(input);

    const datePart = new Intl.DateTimeFormat("th-TH", {
        timeZone: "Asia/Bangkok",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);

    const time24 = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(d);

    const hourNum = Number(time24.slice(0, 2));
    const ampm = hourNum >= 12 ? "PM" : "AM";

    return `${datePart} ${time24} ${ampm}`;
}

function toDateAssumeUTCIfNaive(v: string | number | Date): Date {
    if (v instanceof Date) return v;
    if (typeof v === "number") return new Date(v);

    const s = String(v).trim();
    if (/Z$|[+\-]\d{2}:\d{2}$/.test(s)) return new Date(s);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(s)) {
        return new Date(s + "Z");
    }

    return new Date(s);
}