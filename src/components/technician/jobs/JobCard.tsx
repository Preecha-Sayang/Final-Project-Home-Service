import React, { useState } from "react";
import type { BookingNearby } from "@/types/booking";
import GoogleMapRouteView from "@/components/location/GoogleMapRouteView";
import { useTechnicianLocation } from "@/stores/geoStore";
import { formatThaiDateTimeText } from "lib/client/date/thai";

type Props = {
    job: BookingNearby;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
};

type AddressMetaLite = {
    lat?: number;
    lng?: number;
    subdistrict?: string;
    district?: string;
    province?: string;
    address?: string;
    text?: string;
} | null;

export default function JobCard({ job, onAccept, onDecline }: Props) {
    const { coords } = useTechnicianLocation();
    const [showMap, setShowMap] = useState(false);

    const km =
        job.distance_km == null
            ? "—"
            : Number.isFinite(job.distance_km)
                ? job.distance_km.toFixed(1)
                : "—";

    const destPoint =
        pickCoords(job) ?? { lat: 13.736717, lng: 100.523186 };

    const destName =
        job.address_text ??
        formatAddress((job.address_meta as AddressMetaLite) ?? null) ??
        "";

    return (
        <div className="rounded-xl border p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-500">รหัส: {job.order_code}</div>
                    <div className="font-medium">{job.address_text ?? "-"}</div>
                    <div className="text-sm text-gray-600">
                        ระยะทาง ~ {km} กม.
                        {job.service_date && (
                            <> • {formatThaiDateTimeText(job.service_date, job.service_time)}</>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-2 rounded-lg border"
                        onClick={() => setShowMap(true)}
                    >
                        ดูแผนที่
                    </button>
                    <button
                        className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                        onClick={() => onDecline(job.booking_id)}
                    >
                        ปฏิเสธ
                    </button>
                    <button
                        className="px-3 py-2 rounded-lg bg-[var(--blue-600)] text-white hover:bg-[var(--blue-700)]"
                        onClick={() => onAccept(job.booking_id)}
                    >
                        รับงาน
                    </button>
                </div>
            </div>

            {/* Modal แผนที่ (ใช้ตัวเดียวกับ JobTable) */}
            {showMap && (
                <GoogleMapRouteView
                    open={showMap}
                    onClose={() => setShowMap(false)}
                    origin={{
                        lat: coords?.lat ?? 13.736717,
                        lng: coords?.lng ?? 100.523186,
                    }}
                    destination={destPoint}
                    destinationName={destName}
                />
            )}
        </div>
    );
}

/** เลือกพิกัดที่ดีที่สุดจากงาน */
function pickCoords(job: BookingNearby): { lat: number; lng: number } | null {
    if (
        job.pinned_location &&
        typeof job.pinned_location.lat === "number" &&
        typeof job.pinned_location.lng === "number"
    ) {
        return { lat: job.pinned_location.lat, lng: job.pinned_location.lng };
    }
    if (typeof job.lat === "number" && typeof job.lng === "number") {
        return { lat: job.lat, lng: job.lng };
    }
    const meta = (job.address_meta as AddressMetaLite) ?? null;
    if (typeof meta?.lat === "number" && typeof meta?.lng === "number") {
        return { lat: meta.lat, lng: meta.lng };
    }
    return null;
}

/** ประกอบ address จาก address_meta */
function formatAddress(meta: AddressMetaLite): string | null {
    if (!meta) return null;
    const parts: string[] = [];
    if (meta.address && meta.address.trim().length > 0) parts.push(meta.address.trim());
    if (meta.subdistrict && meta.subdistrict.trim().length > 0) parts.push(meta.subdistrict.trim());
    if (meta.district && meta.district.trim().length > 0) parts.push(meta.district.trim());
    if (meta.province && meta.province.trim().length > 0) parts.push(meta.province.trim());
    const s = parts.join(" ");
    return s.length > 0 ? s : null;
}
