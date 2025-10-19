// ใช้ Mapbox Geocoding API (language=th) แปลง ที่อยู่ <-> พิกัด
// หมายเหตุ: ความครบของ "บ้านเลขที่" อยู่ที่ dataset ของ Mapbox ในพื้นที่นั้น ๆ

const TOKEN = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "").toString();

/** ยืนยันว่ามี token และเป็น string จริง ๆ */
function ensureToken(token: unknown): asserts token is string {
    if (!token || typeof token !== "string") {
        throw new Error("Mapbox token missing. ใส่ NEXT_PUBLIC_MAPBOX_TOKEN ใน .env.local แล้ว restart dev server");
    }
}

/** โครง metadata ที่อยากเก็บลง DB */
export type AddressMeta = {
    houseNumber?: string; // บ้านเลขที่
    road?: string;        // ถนน/ซอย/ชื่อสถานที่
    subdistrict?: string; // ตำบล/แขวง
    district?: string;    // อำเภอ/เขต
    province?: string;    // จังหวัด
    postcode?: string;    // 5 หลัก
    country?: string;     // ประเทศ
};

export type ReverseResult = {
    fullText: string; // ที่อยู่ยาว ๆ ภาษาไทย (fallback)
    meta: AddressMeta; // แยกรายช่องไว้ใช้งาน
};

/** ดึง context.* ตาม prefix id ของ Mapbox เช่น "place" | "district" | "region" | "postcode" */
function findContextText(
    ctx: Array<{ id: string; text: string }> | undefined,
    prefix: string
): string | undefined {
    if (!ctx) return undefined;
    const item = ctx.find((c) => c.id.startsWith(prefix));
    return item?.text;
}

/** map properties/context ของ Mapbox -> AddressMeta (ไทย) */
function toAddressMeta(
    placeName: string,
    feature: {
        address?: string;
        text?: string;
        context?: Array<{ id: string; text: string }>;
    }
): AddressMeta {
    const ctx = feature.context ?? [];

    // Mapbox id semantics (ไทย):
    // - place/district : เขต/อำเภอ (ขึ้นกับ dataset พื้นที่นั้น)
    // - region         : จังหวัด
    // - locality/neighborhood : ตำบล/แขวง
    // - postcode       : รหัสไปรษณีย์
    const postcode = findContextText(ctx, "postcode");
    const province = findContextText(ctx, "region") ?? undefined;

    const subdistrict =
        findContextText(ctx, "locality") ??
        findContextText(ctx, "neighborhood") ??
        undefined;

    const district =
        findContextText(ctx, "district") ??
        findContextText(ctx, "place") ??
        undefined;

    const houseNumber = feature.address; // บ้านเลขที่ (ถ้ามี)
    const road = feature.text;           // ส่วนใหญ่คือชื่อถนน/ซอย หรือชื่อ POI

    const country =
        findContextText(ctx, "country") ??
        (placeName.includes("ประเทศไทย") ? "ประเทศไทย" : undefined);

    return { houseNumber, road, subdistrict, district, province, postcode, country };
}

/** address (ข้อความ) -> lat/lng + fullText */
export async function geocodeAddress(
    query: string
): Promise<{ lat: number; lng: number; fullText: string } | null> {
    ensureToken(TOKEN);

    const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
        `?language=th&limit=1&access_token=${TOKEN}`;

    const r = await fetch(url);
    if (!r.ok) {
        console.error("Mapbox geocode failed", await r.text());
        return null;
    }

    const d = (await r.json()) as {
        features?: Array<{ center: [number, number]; place_name: string }>;
    };

    const f = d.features?.[0];
    if (!f) return null;

    return { lat: f.center[1], lng: f.center[0], fullText: f.place_name };
}

/** lat/lng -> full address (ภาษาไทย) + meta (พยายามดึงบ้านเลขที่) */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseResult | null> {
    ensureToken(TOKEN);

    const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
        // ใส่ types=address ก่อน เพื่อเพิ่มโอกาสได้เลขบ้าน
        `?language=th&limit=1&types=address,place,locality,neighborhood,region,postcode&access_token=${TOKEN}`;

    const r = await fetch(url);
    if (!r.ok) {
        console.error("Mapbox reverse geocode failed", await r.text());
        return null;
    }

    const d = (await r.json()) as {
        features?: Array<{
            place_name: string;
            address?: string;
            text?: string;
            context?: Array<{ id: string; text: string }>;
        }>;
    };

    const f = d.features?.[0];
    if (!f) return null;

    const meta = toAddressMeta(f.place_name, f);
    return { fullText: f.place_name, meta };
}

/** รวมข้อความที่อยู่ไทยแบบอ่านง่าย (ถ้ามี meta ก็ประกอบเอง; ถ้าไม่พอ fallback เป็น fullText) */
export function formatThaiAddress(fullText: string, meta?: AddressMeta | null): string {
    if (!meta) return fullText;

    const parts: string[] = [];
    if (meta.houseNumber) parts.push(`บ้านเลขที่ ${meta.houseNumber}`);
    if (meta.road) parts.push(meta.road);
    if (meta.subdistrict) parts.push(meta.subdistrict);
    if (meta.district) parts.push(meta.district);
    if (meta.province) parts.push(meta.province);
    if (meta.postcode) parts.push(meta.postcode);

    const compact = parts.filter(Boolean).join(", ");
    return compact.length >= 10 ? compact : fullText;
}
