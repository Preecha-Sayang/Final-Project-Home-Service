import type { GeoPoint } from "@/types/location";

const API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY!;

async function safeJson(res: Response) {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Invalid JSON response from Google API: " + text.slice(0, 200));
    }
}

export async function geocodeAddress(address: string) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
    )}&key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocode API error: ${res.status}`);
    const json = await safeJson(res);

    if (json.status !== "OK" || !json.results?.length) {
        throw new Error(`Geocode failed: ${json.status} ${json.error_message || ""}`);
    }

    const loc = json.results[0].geometry.location;
    return {
        lat: loc.lat,
        lng: loc.lng,
        address: json.results[0].formatted_address,
    };
}

export async function getDirections(origin: GeoPoint, destination: GeoPoint) {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Directions API error: ${res.status}`);
    const json = await safeJson(res);

    if (json.status !== "OK" || !json.routes?.length) {
        throw new Error(`Directions failed: ${json.status} ${json.error_message || ""}`);
    }

    const leg = json.routes[0].legs[0];
    return {
        distanceText: leg.distance?.text || "",
        durationText: leg.duration?.text || "",
        polyline: json.routes[0].overview_polyline?.points || "",
    };
}
