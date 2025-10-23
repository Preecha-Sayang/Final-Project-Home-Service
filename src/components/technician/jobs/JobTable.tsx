import React from "react";
import type { BookingNearby } from "@/types/booking";

export type JobTableProps = {
    jobs: BookingNearby[];
    loading?: boolean;
    onAccept?: (id: number) => Promise<void> | void;
    onDecline?: (id: number) => Promise<void> | void;
    onOpen?: (id: number) => void; // เผื่อกดดูรายละเอียด
};

export default function JobTable({
    jobs,
    loading = false,
    onAccept,
    onDecline,
    onOpen,
}: JobTableProps) {
    return (
        <div className="rounded-xl border p-0 overflow-hidden bg-white">
            <div className="border-b px-4 py-3 text-sm text-[var(--gray-600)]">
                {loading ? "กำลังโหลด…" : `พบ ${jobs.length} รายการ`}
            </div>

            <ul className="divide-y">
                {jobs.map((j) => (
                    <li key={j.booking_id} className="p-4 flex items-start justify-between gap-4">
                        <div>
                            <div className="text-[var(--gray-900)] font-medium">
                                #{j.order_code}
                            </div>
                            <div className="text-[var(--gray-700)] text-sm">
                                {j.address_text ?? "-"}
                            </div>
                            <div className="text-[var(--gray-500)] text-xs mt-1">
                                {j.distance_km != null ? `${j.distance_km.toFixed(1)} กม.` : "—"}
                                {" • "}
                                {(j.service_date ?? "-")} {(j.service_time ?? "")}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <a
                                className="h-[36px] rounded-lg border px-3 text-sm hover:bg-[var(--gray-50)] cursor-pointer"
                                href={
                                    j.lat != null && j.lng != null
                                        ? `https://www.google.com/maps/dir/?api=1&destination=${j.lat},${j.lng}`
                                        : undefined
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                ดูแผนที่
                            </a>
                            {onDecline && (
                                <button
                                    type="button"
                                    className="h-[36px] rounded-lg border px-3 text-sm hover:bg-[var(--gray-50)] cursor-pointer"
                                    onClick={() => onDecline(j.booking_id)}
                                >
                                    ปฏิเสธ
                                </button>
                            )}
                            {onAccept && (
                                <button
                                    type="button"
                                    className="h-[36px] rounded-lg bg-[var(--blue-600)] px-3 text-sm text-white hover:bg-[var(--blue-700)] cursor-pointer"
                                    onClick={() => onAccept(j.booking_id)}
                                >
                                    รับงาน
                                </button>
                            )}
                            {onOpen && (
                                <button
                                    type="button"
                                    className="h-[36px] rounded-lg border px-3 text-sm hover:bg-[var(--gray-50)] cursor-pointer"
                                    onClick={() => onOpen(j.booking_id)}
                                >
                                    ดูรายละเอียด
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
