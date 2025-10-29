export type GeocodeResult = { lat: number; lng: number; address?: string } | null;

export async function geocodeText(query: string): Promise<GeocodeResult> {
    if (!query || !query.trim()) return null;
    const res = await fetch(`/api/maps/geocode?q=${encodeURIComponent(query)}`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json) return null;

    if (typeof json.lat === "number" && typeof json.lng === "number") {
        return { lat: json.lat, lng: json.lng, address: json.address };
    }
    return null;
}
