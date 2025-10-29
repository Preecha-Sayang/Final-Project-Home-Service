import { create } from "zustand";
import { reverseGeocode, formatThaiAddress } from "lib/client/maps/googleProvider";

export type LatLng = { lat: number; lng: number };
export type TechnicianLocationRow = {
    lat: number;
    lng: number;
    address_text: string;
    updated_at: string;
};

type LocationApiResponse =
    | { ok: true; location: TechnicianLocationRow | null }
    | { ok: false; message?: string };

type GeoState = {
    addressText: string;
    coords: LatLng | null;
    loading: boolean;
    error?: string;
    loadFromServer: () => Promise<void>;
    reverseAndSave: (
        getPositionOnce: () => Promise<GeolocationPosition | LatLng>
    ) => Promise<void>;
};

/** type guard: เช็คว่าเป็น response รูปแบบที่เรารับได้ */
function isLocationApiResponse(x: unknown): x is LocationApiResponse {
    if (typeof x !== "object" || x === null) return false;
    const obj = x as Record<string, unknown>;
    if (typeof obj.ok !== "boolean") return false;
    if (obj.ok === false) return true;

    if (!("location" in obj)) return false;
    const loc = (obj as { location: unknown }).location;
    if (loc === null) return true;
    if (typeof loc !== "object" || loc === null) return false;
    const r = loc as Record<string, unknown>;
    return (
        typeof r.lat === "number" &&
        typeof r.lng === "number" &&
        typeof r.address_text === "string" &&
        typeof r.updated_at === "string"
    );
}

/** แปลงตำแหน่งจาก union ให้เป็น LatLng */
function coerceToLatLng(
    p: GeolocationPosition | LatLng
): LatLng {
    if ("coords" in p) {
        return { lat: p.coords.latitude, lng: p.coords.longitude };
    }
    return { lat: p.lat, lng: p.lng };
}

/** ดึงตำแหน่งล่าสุดของช่างจากเซิร์ฟเวอร์ */
async function fetchLatestLocation(): Promise<TechnicianLocationRow | null> {
    const r = await fetch("/api/technician/location", {
        credentials: "include",
    });
    const data: unknown = await r.json();

    if (!isLocationApiResponse(data)) {
        throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
    }
    if (data.ok === false) {
        throw new Error(data.message ?? "โหลดตำแหน่งไม่สำเร็จ");
    }
    return data.location;
}

/** เรียก reverse geocode ผ่าน proxy server */
async function reverseAddress(lat: number, lng: number): Promise<string> {
    const r = await reverseGeocode(lat, lng);
    if (!r) return `${lat}, ${lng}`;
    return formatThaiAddress(r.fullText, r.meta);
}



/** POST บันทึกตำแหน่งใหม่ */
async function postLocation(payload: {
    lat: number;
    lng: number;
    address_text: string;
}): Promise<TechnicianLocationRow> {
    const r = await fetch("/api/technician/location", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data: unknown = await r.json();

    if (!isLocationApiResponse(data)) {
        throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
    }
    if (data.ok === false || !data.location) {
        throw new Error(
            ("message" in data && typeof data.message === "string"
                ? data.message
                : "บันทึกตำแหน่งไม่สำเร็จ")
        );
    }
    return data.location;
}

/** Zustand store */
export const useGeoStore = create<GeoState>((set) => ({
    addressText: "",
    coords: null,
    loading: false,
    error: undefined,

    async loadFromServer() {
        set({ loading: true, error: undefined });
        try {
            const loc = await fetchLatestLocation();
            set({
                addressText: loc?.address_text ?? "",
                coords: loc ? { lat: loc.lat, lng: loc.lng } : null,
                loading: false,
            });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ";
            set({ loading: false, error: message });
        }
    },

    async reverseAndSave(getPositionOnce) {
        set({ loading: true, error: undefined });
        try {
            // 1) รับพิกัดจากเบราว์เซอร์หรือ mock
            const raw = await getPositionOnce();
            const { lat, lng } = coerceToLatLng(raw);

            // 2) reverse geocode เป็นที่อยู่
            const fullText = await reverseAddress(lat, lng);

            // 3) บันทึก DB
            const saved = await postLocation({ lat, lng, address_text: fullText });

            // 4) อัปเดต state
            set({
                addressText: saved.address_text,
                coords: { lat: saved.lat, lng: saved.lng },
                loading: false,
            });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
            set({ loading: false, error: message });
            throw e;
        }
    },
}));

export const useTechnicianLocation = useGeoStore;

//# Zustand สำหรับตำแหน่งปัจจุบัน/ที่เลือก