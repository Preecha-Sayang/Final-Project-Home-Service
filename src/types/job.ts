import type { GeoPoint } from "./location";

export type TechnicianJob = {
    booking_id: number;
    order_code: string;
    customer_location: GeoPoint;
    technician_location: GeoPoint;
    address_text: string;
    service_date: string | null;
    service_time: string | null;
};
