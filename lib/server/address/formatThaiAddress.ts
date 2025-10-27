type Addr = {
    houseNo?: string;
    road?: string;
    subDistrict?: string;
    district?: string;
    province?: string;
};

export function formatThaiAddress(addr: Addr): string {
    const parts: string[] = [];
    if (addr.houseNo) parts.push(addr.houseNo);
    if (addr.road) parts.push(addr.road);
    if (addr.subDistrict) parts.push(addr.subDistrict);
    if (addr.district) parts.push(addr.district);
    if (addr.province) parts.push(addr.province);
    if (parts.length === 0) {
        if (addr.subDistrict || addr.district) {
            return `${addr.subDistrict ?? ""} ${addr.district ?? ""} ${addr.province ?? ""}`.trim();
        }
    }
    return parts.join(" ");
}
