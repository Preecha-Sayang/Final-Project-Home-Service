// เวลาไทยแบบพุทธศักราช + รูปแบบ "ในวันที่ 25/04/2563 เวลา 13.00 น."
export function formatThaiDateTimeText(
    serviceDate: string | Date | null | undefined,
    serviceTime?: string | null
): string {
    if (!serviceDate) return "—";
    const d = new Date(serviceDate);
    if (Number.isNaN(d.getTime())) return "—";

    // time อาจเป็น "11:45" หรือ "11:45:00" หรือ null
    let hh = "00";
    let mm = "00";
    if (serviceTime) {
        const [h, m] = serviceTime.split(":");
        if (h && m) {
            hh = h.padStart(2, "0");
            mm = m.padStart(2, "0");
        }
    }

    // แปลงปี ค.ศ. > พ.ศ.
    const dd = String(d.getDate()).padStart(2, "0");
    const mm2 = String(d.getMonth() + 1).padStart(2, "0");
    const yyyyBE = d.getFullYear() + 543;

    // 25/04/2563 เวลา 13.00 น.
    return `${dd}/${mm2}/${yyyyBE} เวลา ${hh}.${mm} น.`;
}
