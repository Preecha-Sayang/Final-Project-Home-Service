export type BookingId = number;

export enum BookingStatusId {
    WaitingAccept = 1,   // รอรับงาน
    WaitingProcess = 2,  // รอดำเนินการ
    InProgress = 3,  // ดำเนินการอยู่
    Completed = 4,  // เสร็จสิ้น
    Canceled = 5,  // ยกเลิก
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

// งานใกล้เคียง
export type BookingNearby = {
    booking_id: number;
    order_code: string;
    address_text: string | null;
    lat: number | null;
    lng: number | null;
    distance_km: number | null;   // null ถ้าคำนวณไม่ได้
    service_date: string | null;  // ISO หรือ null
    service_time: string | null;  // HH:mm หรือ null
    status_id: BookingStatusId;
};