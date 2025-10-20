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
