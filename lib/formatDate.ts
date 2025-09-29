export function formatThaiDateTimeAMPM(input: string | number | Date) {
    const d = new Date(input);

    // วันที่ไทย (พ.ศ.)
    const datePart = new Intl.DateTimeFormat("th-TH", {
        timeZone: "Asia/Bangkok",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);

    // เวลา 24 ชม. ชัดเจน ไม่งง SSR ด้วย timeZone
    const time24 = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(d); // -> "14:29"

    const hourNum = Number(time24.slice(0, 2));
    const ampm = hourNum >= 12 ? "PM" : "AM";

    return `${datePart} ${time24} ${ampm}`; // -> "23/09/2568 14:29 PM"
}