import { create } from "zustand";
import { http } from "lib/client/http";
import { reverseGeocode, AddressMeta } from "lib/client/maps/mapboxProvider";

export type Coords = { lat: number; lng: number };

type LocationRow = {
    lat: number;
    lng: number;
    address_text: string;
    address_meta?: AddressMeta | null;
    updated_at: string;
};

type LocationResp = { ok: boolean; location: LocationRow | null };

type State = {
    coords: Coords | null;
    addressText: string;
    meta: AddressMeta | null;
    loading: boolean;
    error: string | null;

    loadFromServer: () => Promise<void>;
    reverseAndSave: (getBrowserCoords: () => Promise<Coords>) => Promise<void>;
};

export const useTechnicianLocation = create<State>((set, get) => ({
    coords: null,
    addressText: "",
    meta: null,
    loading: false,
    error: null,

    // ดึงจาก DB ครั้งแรก (มี token ถึงจะได้)
    async loadFromServer() {
        try {
            set({ loading: true, error: null });
            const { data } = await http.get<LocationResp>("/technician/location");
            const loc = data.location ?? null;
            if (loc) {
                set({
                    coords: { lat: loc.lat, lng: loc.lng },
                    addressText: loc.address_text,
                    meta: (loc.address_meta as AddressMeta) ?? null,
                    loading: false,
                });
            } else {
                set({ loading: false });
            }
        } catch (e) {
            // เงียบ ๆ ไว้ ไม่ popup รบกวนหน้าแรก (เผื่อยังไม่ login)
            set({ loading: false });
        }
    },

    // ขอพิกัดจากเบราว์เซอร์ -> reverse geocode -> บันทึก -> อัปเดต state
    async reverseAndSave(getBrowserCoords) {
        try {
            set({ loading: true, error: null });

            // 1) ขอพิกัดจากเบราว์เซอร์
            const c = await getBrowserCoords();

            // 2) แปลงเป็นที่อยู่ไทย
            const rev = await reverseGeocode(c.lat, c.lng);
            if (!rev) throw new Error("แปลงพิกัดเป็นที่อยู่ไม่สำเร็จ");

            // 3) POST เก็บใน DB
            const payload = {
                lat: c.lat,
                lng: c.lng,
                address_text: rev.fullText,
                meta: rev.meta,
            };
            const { data } = await http.post<LocationResp>("/technician/location", payload);

            // 4) อัปเดต state
            set({
                coords: { lat: data.location?.lat ?? c.lat, lng: data.location?.lng ?? c.lng },
                addressText: data.location?.address_text ?? rev.fullText,
                meta: (data.location?.address_meta as AddressMeta) ?? rev.meta,
                loading: false,
            });
        } catch (e) {
            set({ loading: false, error: e instanceof Error ? e.message : String(e) });
            throw e;
        }
    },
}));
