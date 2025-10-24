import React, { useMemo, useState } from "react";
import type { BookingNearby } from "@/types/booking";
import ConfirmDialogDanger from "@/components/dialog/confirm_dialog_danger";
import { formatThaiDateTimeText } from "lib/client/date/thai";
import { useTechnicianLocation } from "@/stores/geoStore";

type Props = {
    jobs: BookingNearby[];
    onAccept: (id: number) => Promise<boolean> | boolean;
    onDecline: (id: number) => Promise<boolean> | boolean;
};

type Mode = "accept" | "decline";

export default function JobTable({ jobs, onAccept, onDecline }: Props) {
    const [mode, setMode] = useState<Mode | null>(null);
    const [selected, setSelected] = useState<BookingNearby | null>(null);
    const [busy, setBusy] = useState(false);

    // สำหรับแผนที่ภายในหน้า
    const [openMap, setOpenMap] = useState(false);
    const { coords } = useTechnicianLocation(); // { lat, lng } จาก store

    const [confirm, setConfirm] = useState<{
        open: boolean;
        mode: "accept" | "decline";
        job?: BookingNearby;
    }>({ open: false, mode: "accept" });

    const openConfirm = (m: Mode, job: BookingNearby) => {
        setMode(m);
        setSelected(job);
    };
    const closeConfirm = () => {
        if (busy) return;
        setMode(null);
        setSelected(null);
    };
    const doConfirm = async () => {
        if (!selected || !mode) return;
        try {
            setBusy(true);
            if (mode === "accept") await onAccept(selected.booking_id);
            else await onDecline(selected.booking_id);
            closeConfirm();
        } finally {
            setBusy(false);
        }
    };

    const title = useMemo(() => {
        if (!mode) return "";
        return mode === "accept" ? "ยืนยันการรับงาน?" : "ยืนยันการปฏิเสธงาน?";
    }, [mode]);

    const desc = useMemo(() => {
        if (!selected) return null;
        const whenText = formatThaiDateTimeText(
            selected.service_date,
            selected.service_time
        );
        return (
            <div className="mt-2 text-base text-[var(--gray-700)]">
                คุณสามารถให้บริการ <strong>‘{selected.order_code}’</strong>
                <br />
                {selected.address_text ?? "-"}
                <br />
                {whenText}
            </div>
        );
    }, [selected]);

    const confirmWhen = useMemo(() => {
        if (!confirm.job) return null;
        return formatThaiDateTimeText(
            confirm.job.service_date,
            confirm.job.service_time
        );
    }, [confirm.job?.service_date, confirm.job?.service_time]);

    return (
        <>
            <div className="space-y-3">
                {jobs.length === 0 && (
                    <div className="text-sm text-[var(--gray-500)]">พบ 0 รายการ</div>
                )}

                {jobs.map((job) => (
                    <div key={job.booking_id} className="rounded-xl border p-5 bg-white">
                        <div className="flex items-start justify-between gap-4">
                            {/* ซ้าย: รายละเอียดหลัก */}
                            <div className="flex-1">
                                <div className="text-[var(--gray-900)] text-lg font-semibold mb-1">
                                    {Array.isArray(job.item_names) && job.item_names.length > 0
                                        ? job.item_names.join(", ")
                                        : "—"}
                                </div>

                                <div className="grid gap-1 text-sm">
                                    <div className="text-[var(--gray-600)]">
                                        รหัสคำสั่งซ่อม{" "}
                                        <span className="text-[var(--gray-900)] font-medium">
                                            {job.order_code}
                                        </span>
                                    </div>

                                    <div className="text-[var(--gray-600)]">
                                        ราคารวม{" "}
                                        <span className="text-[var(--gray-900)] font-medium">
                                            {job.total_price != null
                                                ? `${job.total_price.toLocaleString()} ฿`
                                                : "—"}
                                        </span>
                                    </div>

                                    <div className="text-[var(--gray-600)]">
                                        สถานที่{" "}
                                        <span className="text-[var(--gray-900)]">
                                            {job.address_text ?? "—"}
                                        </span>
                                        {job.lat != null && job.lng != null && (
                                            <button
                                                className="inline-flex items-center gap-1 text-[var(--blue-700)] underline underline-offset-2 ml-2 cursor-pointer"
                                                onClick={() => {
                                                    setConfirm((c) => ({ ...c, job }));
                                                    setOpenMap(true);
                                                }}
                                            >
                                                ดูแผนที่
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ขวา: เวลานัด */}
                            <div className="min-w-[240px] text-right">
                                <div className="text-[var(--gray-600)] text-sm">วันเวลาดำเนินการ</div>
                                <div className="text-[var(--blue-700)] font-medium">
                                    {formatThaiDateTimeText(job.service_date, job.service_time)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirm({ open: true, mode: "decline", job })}
                                className="mr-2 inline-flex items-center gap-2 rounded-lg border border-[var(--gray-300)] px-3 py-2 text-sm text-[var(--gray-800)] hover:bg-[var(--gray-100)] cursor-pointer"
                            >
                                ปฏิเสธ
                            </button>

                            <button
                                type="button"
                                onClick={() => setConfirm({ open: true, mode: "accept", job })}
                                className="inline-flex items-center gap-2 rounded-lg bg-[var(--blue-600)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                            >
                                รับงาน
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmDialogDanger
                open={confirm.open}
                tone={confirm.mode}
                title={confirm.mode === "accept" ? "ยืนยันการรับงาน?" : "ยืนยันการปฏิเสธงาน?"}
                description={
                    <div>
                        <div>
                            คุณสามารถให้บริการ <b>{confirm.job?.order_code}</b>
                        </div>
                        {confirmWhen && (
                            <div className="mt-1">{confirmWhen}</div>
                        )}
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
        </>
    );
}
