import type { GeoPoint } from "@/types/location";

export type ReverseMeta = {
    components?: Record<string, string>;
    raw?: unknown;
};

export async function reverseGeocode(lat: number, lng: number) {
    const r = await fetch(`/api/geocode/google-reverse?lat=${lat}&lng=${lng}`);
    const json = await r.json();
    if (json.status !== "OK") {
        console.warn("[reverseGeocode] status:", json.status, "error:", json.error_message);
        return null;
    }
    const res = json?.results?.[0];
    if (!res) return null;
    return {
        fullText: res.formatted_address as string,
        meta: { raw: res, components: indexAddressComponents(res.address_components) },
    };
}


function indexAddressComponents(arr: any[] = []): Record<string, string> {
    const out: Record<string, string> = {};
    for (const c of arr) {
        const types: string[] = c.types || [];
        const key = types[0];
        if (key) out[key] = c.long_name;
    }
    return out;
}

// ตัดแต่งให้อ่านง่ายแบบไทย (เบา ๆ พอ)
export function formatThaiAddress(full: string, meta?: ReverseMeta): string {
    const c = meta?.components || {};

    const no = c["street_number"];                       // เลขที่บ้าน
    const road = c["route"];                              // ถนน
    const subdist = c["sublocality_level_1"] || c["sublocality"] || c["administrative_area_level_3"];
    const dist = c["locality"] || c["administrative_area_level_2"];
    const province = c["administrative_area_level_1"];
    const postcode = c["postal_code"];

    // ตรวจว่าเป็นกรุงเทพฯ ไหม เพื่อเลือกคำว่า แขวง/เขต
    const isBKK = (province || "").includes("กรุงเทพ");

    const chunkRoad = [no, road].filter(Boolean).join(" ");                // "123/45 ถนนอินทามระ"
    const chunkSub = subdist ? (isBKK ? `แขวง${subdist}` : `ต.${subdist}`) : "";
    const chunkDist = dist ? (isBKK ? `เขต${dist}` : `อ.${dist}`) : "";
    const chunkProv = province ? (isBKK ? province : `จ.${province}`) : "";
    const chunkPost = postcode || "";

    const parts = [chunkRoad, chunkSub, chunkDist, chunkProv, chunkPost].filter(Boolean);
    // ถ้าไม่ได้ component ใดๆ เลย ให้ fallback เป็นข้อความเต็มจาก Google
    return parts.length ? parts.join(" ") : full;
}

export async function fetchDirections(origin: GeoPoint, destination: GeoPoint) {
    const resp = await fetch("/api/maps/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
    });
    if (!resp.ok) throw new Error("Failed to fetch directions");
    return resp.json() as Promise<{
        distanceText: string;
        durationText: string;
        polyline: string;
    }>;
}

export async function fetchGeocode(addressData: any) {
    const resp = await fetch("/api/maps/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
    });
    if (!resp.ok) throw new Error("Failed to geocode");
    return resp.json() as Promise<{ lat: number; lng: number; address: string }>;
}