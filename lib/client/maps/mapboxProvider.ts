const TOKEN = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "").toString();

function ensureToken(token: unknown): asserts token is string {
    if (!token || typeof token !== "string") {
        throw new Error("Mapbox token missing. ใส่ NEXT_PUBLIC_MAPBOX_TOKEN ใน .env.local แล้ว restart dev server");
    }
}

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
    fullText: string;
    meta: AddressMeta;
};

function findContextText(
    ctx: Array<{ id: string; text: string }> | undefined,
    prefix: string
): string | undefined {
    if (!ctx) return undefined;
    const item = ctx.find((c) => c.id.startsWith(prefix));
    return item?.text;
}

function toAddressMeta(
    placeName: string,
    feature: {
        address?: string;
        text?: string;
        context?: Array<{ id: string; text: string }>;
    }
): AddressMeta {
    const ctx = feature.context ?? [];
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

    const houseNumber = feature.address;
    const road = feature.text;

    const country =
        findContextText(ctx, "country") ??
        (placeName.includes("ประเทศไทย") ? "ประเทศไทย" : undefined);

    return { houseNumber, road, subdistrict, district, province, postcode, country };
}

/** address > lat/lng + fullText */
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

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseResult | null> {
    ensureToken(TOKEN);

    const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
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
