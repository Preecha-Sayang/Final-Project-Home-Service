import React from "react";
import type { BookingNearby } from "@/types/booking";

type Geo = { lat: number; lng: number };

function haversineKm(a: Geo, b: Geo): number {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const la1 = (a.lat * Math.PI) / 180;
    const la2 = (b.lat * Math.PI) / 180;
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(x));
}

// ประมาณเวลาเดินทางแบบรถวิ่งในเมือง 30 กม./ชม. (คร่าว ๆ)
function roughEtaMinutes(distanceKm: number): number {
    if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
    const speed = 30; // km/h
    return Math.round((distanceKm / speed) * 60);
}

type Props = {
    open: boolean;
    job: BookingNearby | null;
    technician?: Geo | null; // จาก geoStore
    onClose: () => void;
};

export default function JobMapDialog({ open, job, technician, onClose }: Props) {
    if (!open || !job || !job.lat || !job.lng) return null;
    const dest = { lat: job.lat, lng: job.lng };
    const origin = technician ?? null;

    const dist = origin ? haversineKm(origin, dest) : null;
    const eta = dist != null ? roughEtaMinutes(dist) : null;

    const originParam = origin ? `${origin.lat},${origin.lng}` : "";
    const destParam = `${dest.lat},${dest.lng}`;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold">เส้นทางไปยังลูกค้า</div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 text-[var(--gray-400)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* แผนที่ (embed) */}
                <div className="rounded-lg overflow-hidden border">
                    <iframe
                        title="route"
                        width="100%"
                        height="360"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        // ใช้ Directions embed (ไม่มี key ก็ยังแสดงเส้นทาง basic ได้)
                        src={`https://www.google.com/maps/embed/v1/directions?key=&origin=${encodeURIComponent(
                            originParam
                        )}&destination=${encodeURIComponent(destParam)}&mode=driving`}
                    />
                </div>

                <div className="mt-4 grid gap-2 text-sm">
                    <div>
                        <span className="text-[var(--gray-500)]">ปลายทาง: </span>
                        <span className="text-[var(--gray-800)]">
                            {job.address_text ?? "-"}
                        </span>
                    </div>
                    {dist != null && (
                        <div>
                            <span className="text-[var(--gray-500)]">ระยะทางโดยประมาณ: </span>
                            <span className="text-[var(--gray-800)]">
                                ~ {dist.toFixed(1)} กม. (ETA ~ {eta} นาที)
                            </span>
                        </div>
                    )}
                    <div className="flex gap-2 mt-2">
                        <a
                            className="px-3 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
                            href={`https://www.google.com/maps/dir/?api=1&destination=${destParam}${origin ? `&origin=${originParam}` : ""
                                }`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            เปิดใน Google Maps
                        </a>
                        <button
                            onClick={onClose}
                            className="px-3 py-2 rounded-lg bg-[var(--blue-600)] text-white hover:bg-[var(--blue-700)]"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
