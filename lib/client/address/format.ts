import type { AddressData } from "@/types/address";

export function formatAddress(addr?: AddressData | null): string {
    if (!addr) return "-";
    // เคสมีสตริงรวมมาให้เลย
    if (addr.full) return addr.full;
    if (addr.text) return addr.text;
    if (addr.address) return addr.address;

    const parts = [
        addr.line1,
        addr.line2,
        addr.village,
        addr.moo,
        addr.soi,
        addr.road,
        addr.subdistrict ?? addr.tambon,
        addr.district ?? addr.amphoe,
        addr.province,
        addr.postcode ?? addr.zipcode,
    ]
        .map(v => (v ?? "").toString().trim())
        .filter(Boolean);

    return parts.length ? parts.join(", ") : "-";
}
