export type ReverseMeta = {
    components?: Record<string, string>;
    raw?: unknown;
};

export async function reverseGeocode(lat: number, lng: number): Promise<{ fullText: string; meta: ReverseMeta } | null> {
    const r = await fetch(`/api/geocode/google-reverse?lat=${lat}&lng=${lng}`);
    if (!r.ok) return null;
    const json = await r.json();
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
    // ว่าจะปรับแต่งรายละเอียดด้วย เดี๋ยวค่อยทำ
    return full;
}