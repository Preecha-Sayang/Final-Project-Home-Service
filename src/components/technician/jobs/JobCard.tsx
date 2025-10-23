import React from "react";
import type { BookingNearby } from "@/types/booking";

type Props = {
    job: BookingNearby;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
};

export default function JobCard({ job, onAccept, onDecline }: Props) {
    const km =
        job.distance_km == null
            ? "—"
            : Number.isFinite(job.distance_km)
                ? job.distance_km.toFixed(1)
                : "—";

    return (
        <div className="rounded-xl border p-4 flex items-center justify-between">
            <div>
                <div className="text-sm text-gray-500">รหัส: {job.order_code}</div>
                <div className="font-medium">{job.address_text ?? "-"}</div>
                <div className="text-sm text-gray-600">
                    ระยะทาง ~ {km} กม.
                    {job.service_date && (
                        <>
                            {" "}
                            • {job.service_date} {job.service_time ?? ""}
                        </>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <a
                    className="px-3 py-2 rounded-lg border"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    ดูแผนที่
                </a>
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
    );
}
