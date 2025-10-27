export type GeoPoint = { lat: number; lng: number };

export type Address = {
    houseNo: string;
    village?: string;
    road?: string;
    subDistrict?: string; // ตำบล/แขวง
    district?: string;    // อำเภอ/เขต
    province?: string;
    postalCode?: string;
    fullText: string;     // ที่อยู่รวม (สำหรับโชว์)
};

export type PickedLocation = {
    point: GeoPoint;
    address: Address;
    source: "gps" | "search" | "drag";
};

export type AddressRecord = {
    address_id: number;
    user_id: number | null;
    label: string | null;
    place_name: string | null;
    address_line1: string | null;
    address_line2: string | null;
    district: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number;
    lng: number;
    created_at: string;
    updated_at: string;
};

export type TechnicianLocation = {
    user_id: number;
    lat: number;
    lng: number;
    updated_at: string;
};

export type LatLng = { lat: number; lng: number };
export type GeoPermission = "granted" | "denied" | "prompt" | "unknown";

export type AddressData = {
    address?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    postcode?: string;
    additional_info?: string;
    text?: string;
};