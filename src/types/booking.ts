export type BookingId = number;

export type BookingSubItem = {
    service_option_id: number;
    name: string;
    quantity: number;
    unit: string | null;
    unit_price: number | null;
    subtotal_price: number | null;
};

export enum BookingStatusId {
    WaitingAccept = 1,
    WaitingProcess = 2,
    Completed = 3,
    Canceled = 4,
}

export type BookingAction =
    | "TECH_ACCEPT"
    | "TECH_DECLINE"
    | "TECH_START"
    | "TECH_COMPLETE"
    | "TECH_CANCEL";

export type JobListItem = {
    booking_id: number;
    title: string; // ชื่อบริการสรุป (ถ้ายังไม่มี ใช้ order_code ไปก่อน)
    address_text: string;
    lat: number | null;
    lng: number | null;
    distance_km: number | null;
    status_id: BookingStatusId;
    service_date: string | null;
    service_time: string | null;
    order_code: string;
};

// โครง address_data
export type AddressMeta = {
    text?: string;
    lat?: number;
    lng?: number;
    address?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    [k: string]: unknown;
} | null;

// งานใกล้เคียง
export type BookingNearby = {
    booking_id: number;
    order_code: string;
    address_text: string | null;
    address_meta?: AddressMeta | null;
    lat: number | null;
    lng: number | null;
    distance_km: number | null;
    service_date: string | null;
    service_time: string | null;
    status_id: BookingStatusId;
    total_price?: number | null;
    item_names?: string[];
    service_titles?: string[];
    sub_items?: BookingSubItem[];
    pinned_location?: PinnedLocation | null;
};

// geo point จากการปักหมุดหน้า booking นะ
export type PinnedLocation = {
    lat: number;
    lng: number;
    text?: string;
    place_name?: string | null;
};