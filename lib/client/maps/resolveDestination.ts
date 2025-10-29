import type { BookingNearby } from "@/types/booking";
import type { GeoPoint } from "@/types/location";
import { geocodeText } from "./requests";

type AddressMetaLite = {
    address?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    lat?: number;
    lng?: number;
    text?: string;
} | null;

export function formatAddress(meta: AddressMetaLite): string | null {
    if (!meta) return null;
    const parts: string[] = [];
    if (meta.address?.trim()) parts.push(meta.address.trim());
    if (meta.subdistrict?.trim()) parts.push(meta.subdistrict.trim());
    if (meta.district?.trim()) parts.push(meta.district.trim());
    if (meta.province?.trim()) parts.push(meta.province.trim());
    const s = parts.join(" ");
    return s || null;
}

/** เลือกพิกัดที่ดีที่สุด + ชื่อปลายทาง */
export async function resolveBestDestination(
    job: BookingNearby
): Promise<{ point: GeoPoint; name: string }> {
    // 1) ใช้ pinned_location ก่อน
    if (
        job.pinned_location &&
        typeof job.pinned_location.lat === "number" &&
        typeof job.pinned_location.lng === "number"
    ) {
        const name =
            job.pinned_location.text?.trim() ||
            job.pinned_location.place_name?.trim() ||
            job.address_text ||
            formatAddress(job.address_meta as AddressMetaLite) ||
            "";
        return { point: { lat: job.pinned_location.lat, lng: job.pinned_location.lng }, name };
    }

    // 2) ฟิลด์ lat/lng ตรง ๆ (จากคอลัมน์)
    if (typeof job.lat === "number" && typeof job.lng === "number") {
        const name = job.address_text || formatAddress(job.address_meta as AddressMetaLite) || "";
        return { point: { lat: job.lat, lng: job.lng }, name };
    }

    // 3) lat/lng ใน address_meta
    const meta = (job.address_meta as AddressMetaLite) ?? null;
    if (typeof meta?.lat === "number" && typeof meta?.lng === "number") {
        const name = job.address_text || formatAddress(meta) || "";
        return { point: { lat: meta.lat, lng: meta.lng }, name };
    }

    // 4) geocode จากข้อความที่ดีที่สุด
    const query =
        job.address_text?.trim() ||
        formatAddress(meta) ||
        meta?.text?.trim() ||
        "";

    if (query) {
        const g = await geocodeText(query);
        if (g) {
            return { point: { lat: g.lat, lng: g.lng }, name: g.address || query };
        }
    }

    // 5) fallback BKK center (ไม่ควรเกิดบ่อย)
    return {
        point: { lat: 13.736717, lng: 100.523186 },
        name: job.address_text || formatAddress(meta) || "Bangkok",
    };
}
