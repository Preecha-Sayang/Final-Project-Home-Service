import React, { useMemo, useState } from "react";
import type { BookingNearby } from "@/types/booking";
import ConfirmDialogDanger from "@/components/dialog/confirm_dialog_danger";
import GoogleLocationPickerModal, { Picked } from "@/components/location/GoogleLocationPickerModal";
import { formatThaiDateTimeText } from "lib/client/date/thai";

type AddressMetaLite = {
    lat?: number;
    lng?: number;
    subdistrict?: string;
    district?: string;
    province?: string;
    text?: string;
} | null;

type Props = {
    jobs: BookingNearby[];
    onAccept: (id: number) => Promise<boolean> | boolean;
    onDecline: (id: number) => Promise<boolean> | boolean;
};

type Mode = "accept" | "decline";

export default function JobTable({ jobs, onAccept, onDecline }: Props) {
    const [busy, setBusy] = useState(false);

    const [confirm, setConfirm] = useState<{
        open: boolean;
        mode: Mode;
        job?: BookingNearby;
    }>({ open: false, mode: "accept" });

    const [mapOpen, setMapOpen] = useState(false);
    const [mapJob, setMapJob] = useState<BookingNearby | null>(null);

    const confirmWhen = useMemo(() => {
        if (!confirm.job) return null;
        return formatThaiDateTimeText(confirm.job.service_date, confirm.job.service_time);
    }, [confirm.job?.service_date, confirm.job?.service_time]);

    return (
        <>
            <div className="space-y-3 w-full">
                {jobs.length === 0 && <div className="text-sm text-[var(--gray-500)]">พบ 0 รายการ</div>}

                {jobs.map((job) => {
                    const title =
                        Array.isArray(job.service_titles) && job.service_titles.length > 0
                            ? job.service_titles.join(", ")
                            : Array.isArray(job.item_names) && job.item_names.length > 0
                                ? job.item_names.join(", ")
                                : "—";

                    const SubItems =
                        Array.isArray(job.sub_items) && job.sub_items.length > 0 ? (
                            <div className="flex my-2 text-base">
                                <div className="text-[var(--gray-600)] w-[136px]">รายการย่อย</div>
                                <div className="list-disc space-y-0.5">
                                    {job.sub_items.map((it) => (
                                        <div key={it.service_option_id} className="text-[var(--gray-800)]">
                                            <span className="font-medium">{it.name}</span>
                                            {typeof it.quantity === "number" && (
                                                <>
                                                    {" "}× {it.quantity}
                                                    {it.unit ? ` ${it.unit}` : ""}
                                                </>
                                            )}
                                            {it.subtotal_price != null && <> — {Number(it.subtotal_price).toLocaleString()} ฿</>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null;

                    const coords = pickCoords(job);

                    return (
                        <div key={job.booking_id} className="rounded-xl border p-5 bg-white">
                            {/* แถวบน: ชื่อบริการ + วันเวลา */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="text-[var(--gray-900)] text-lg font-semibold mb-1">{title}</div>
                                </div>

                                <div className="flex items-center min-w-[240px] text-right font-medium gap-4">
                                    <div className="text-[var(--gray-600)] text-base">วันเวลาดำเนินการ</div>
                                    <div className="text-[var(--blue-700)]">
                                        {formatThaiDateTimeText(job.service_date, job.service_time)}
                                    </div>
                                </div>
                            </div>

                            {/* รายละเอียดซ้าย + ปุ่มขวา */}
                            <div className="mt-2">
                                {/* รหัสคำสั่งซ่อม */}
                                <div className="flex text-base text-[var(--gray-700)]">
                                    <div className="w-[136px]">รหัสคำสั่งซ่อม</div>
                                    <div className="text-[var(--gray-900)] font-medium">{job.order_code}</div>
                                </div>

                                {/* รายการย่อย */}
                                {SubItems}

                                {/* ราคารวม */}
                                <div className="flex text-base text-[var(--gray-700)]">
                                    <div className="w-[136px]">ราคารวม</div>
                                    <span className="text-[var(--gray-900)] font-medium">
                                        {job.total_price != null ? `${job.total_price.toLocaleString()} ฿` : "—"}
                                    </span>
                                </div>

                                {/* สถานที่ + ปุ่มดูแผนที่ | ปุ่มรับ/ปฏิเสธ */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex text-base text-[var(--gray-700)]">
                                        <div className="w-[136px]">สถานที่</div>
                                        <span className="text-[var(--gray-900)]">{job.address_text ?? "—"}</span>
                                        <button
                                            type="button"
                                            // onClick={onOpenMap}
                                            onClick={() => { setMapJob(job); setMapOpen(true); }}
                                            className="inline-flex items-center gap-1 text-[var(--blue-700)] underline underline-offset-2 ml-2 cursor-pointer"
                                            title="ดูแผนที่"
                                        >
                                            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                                                    stroke="currentColor" strokeWidth={1.5} />
                                            </svg>
                                            ดูแผนที่
                                        </button>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setConfirm({ open: true, mode: "decline", job })}
                                            className="inline-flex items-center justify-center w-[112px] h-[44px] gap-2 rounded-lg border border-[var(--gray-300)] bg-white px-4 py-2 text-base text-[var(--gray-800)] hover:bg-[var(--gray-50)] cursor-pointer"
                                        >
                                            ปฏิเสธ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirm({ open: true, mode: "accept", job })}
                                            className="inline-flex items-center justify-center w-[112px] h-[44px] gap-2 rounded-lg bg-[var(--blue-600)] px-4 py-2 text-base font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                                        >
                                            รับงาน
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ยืนยัน */}
            <ConfirmDialogDanger
                open={confirm.open}
                tone={confirm.mode}
                title={confirm.mode === "accept" ? "ยืนยันการรับงาน?" : "ยืนยันการปฏิเสธงาน?"}
                description={
                    <div>
                        <div>
                            คุณสามารถให้บริการ <b>{confirm.job?.order_code}</b>
                        </div>
                        {confirmWhen && <div className="mt-1">{confirmWhen}</div>}
                    </div>
                }
                confirmLabel={confirm.mode === "accept" ? "ยืนยันการรับงาน" : "ยืนยันการปฏิเสธ"}
                cancelLabel="ยกเลิก"
                onConfirm={async () => {
                    if (!confirm.job) return;
                    try {
                        setBusy(true);
                        const ok =
                            confirm.mode === "accept"
                                ? await onAccept(confirm.job.booking_id)
                                : await onDecline(confirm.job.booking_id);
                        if (ok) setConfirm({ open: false, mode: "accept" });
                    } finally {
                        setBusy(false);
                    }
                }}
                onCancel={() => setConfirm({ open: false, mode: "accept" })}
            />

            {/* ดูแผนที่ — ใช้ fallback เมื่อไม่มีพิกัดจริง */}
            {mapJob && (
                <GoogleLocationPickerModal
                    open={mapOpen}
                    onClose={() => setMapOpen(false)}
                    initial={makePickedFromJob(mapJob)}
                    onConfirm={() => setMapOpen(false)}
                    readOnly
                    hideHeader
                    hideActions
                />
            )}
        </>
    );
}

/** แปลง BookingNearby -> Picked พร้อม fallback */
function makePickedFromJob(job: BookingNearby): Picked {
    const meta: AddressMetaLite = (job.address_meta as AddressMetaLite) ?? null;

    const c = pickCoords(job) ?? { lat: 13.755082, lng: 100.493153 };

    const parts: string[] = [];
    if (meta?.subdistrict) parts.push(meta.subdistrict);
    if (meta?.district) parts.push(meta.district);
    if (meta?.province) parts.push(meta.province);

    const place_name = job.address_text ?? (parts.length ? parts.join(" ") : undefined);

    return { point: c, place_name };
}

function pickCoords(job: BookingNearby): { lat: number; lng: number } | null {
    if (job.pinned_location
        && typeof job.pinned_location.lat === "number"
        && typeof job.pinned_location.lng === "number") {
        return { lat: job.pinned_location.lat, lng: job.pinned_location.lng };
    }
    if (typeof job.lat === "number" && typeof job.lng === "number") {
        return { lat: job.lat, lng: job.lng };
    }
    const meta: AddressMetaLite = (job.address_meta as AddressMetaLite) ?? null;
    if (typeof meta?.lat === "number" && typeof meta?.lng === "number") {
        return { lat: meta.lat, lng: meta.lng };
    }
    return null;
}
