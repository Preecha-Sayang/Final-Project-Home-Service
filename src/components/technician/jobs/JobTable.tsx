import React, { useMemo, useState, useEffect, useRef } from "react";
import { Pagination } from "rsuite";
import type { BookingNearby } from "@/types/booking";
import ConfirmDialogDanger from "@/components/dialog/confirm_dialog_danger";
import { formatThaiDateTimeText } from "lib/client/date/thai";
import GoogleMapRouteView from "@/components/location/GoogleMapRouteView";
import { useTechnicianLocation } from "@/stores/geoStore";
import { formatAddress } from "lib/client/maps/resolveDestination";
import type { GeoPoint } from "@/types/location";

type Props = {
    jobs?: BookingNearby[];
    onAccept: (id: number) => Promise<boolean> | boolean;
    onDecline: (id: number) => Promise<boolean> | boolean;
};

type Mode = "accept" | "decline";

const PAGE_SIZE = 10;
const EMPTY: BookingNearby[] = [];

export default function JobTable({ jobs, onAccept, onDecline }: Props) {
    const list = jobs ?? EMPTY;
    const total = list.length;

    const [busy, setBusy] = useState(false);
    const { coords } = useTechnicianLocation();

    const [confirm, setConfirm] = useState<{
        open: boolean;
        mode: Mode;
        job?: BookingNearby;
    }>({ open: false, mode: "accept" });

    const [mapOpen, setMapOpen] = useState(false);
    const [mapJob, setMapJob] = useState<BookingNearby | null>(null);

    const [page, setPage] = useState(1);
    const topRef = useRef<HTMLDivElement | null>(null);

    // ปลายทางที่ resolve แล้ว (ดีที่สุด)
    const [resolvedDest, setResolvedDest] = useState<{ point: GeoPoint; name: string } | null>(null);

    // กันกดซ้ำ / กันกดเมื่อ route ไม่ได้ (ยังคงไว้ แต่จะไม่ใช้เมื่อไม่มี pinned_location)
    const [resolvingId, setResolvingId] = useState<number | null>(null);
    const [cantRouteIds, setCantRouteIds] = useState<Set<number>>(new Set());

    // ให้หน้าอยู่ในช่วง valid เสมอเมื่อจำนวนรายการเปลี่ยน
    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
        if (page < 1) setPage(1);
    }, [total, page]);

    const pagedJobs = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return list.slice(start, start + PAGE_SIZE);
    }, [list, page]);

    const confirmWhen = useMemo(() => {
        if (!confirm.job) return null;
        return formatThaiDateTimeText(confirm.job.service_date, confirm.job.service_time);
    }, [confirm.job]);

    return (
        <>
            <div ref={topRef} />
            <div className="space-y-3 w-full" data-busy={busy ? "1" : "0"}>
                {total === 0 && <div className="text-sm text-[var(--gray-500)]">พบ 0 รายการ</div>}

                {pagedJobs.map((job) => {
                    const title =
                        (Array.isArray(job.service_titles) &&
                            job.service_titles.length > 0 &&
                            job.service_titles.join(", ")) ||
                        (Array.isArray(job.item_names) && job.item_names.length > 0 && job.item_names.join(", ")) ||
                        "—";

                    const SubItems =
                        Array.isArray(job.sub_items) && job.sub_items.length > 0 ? (
                            <div className="flex my-2 text-base">
                                <div className="text-[var(--gray-600)] w-[136px]">รายการย่อย</div>
                                <div className="list-disc space-y-0.5">
                                    {job.sub_items.map((it, idx) => (
                                        <div
                                            key={`${job.booking_id}-${it.service_option_id}-${idx}`}
                                            className="text-[var(--gray-800)]"
                                        >
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

                    // แสดงที่อยู่: ใช้ address_text ก่อน / ไม่มีก็ format จาก meta
                    const displayAddress =
                        job.address_text ?? formatAddress((job.address_meta as unknown) ?? null) ?? "—";

                    // อนุญาต “ดูแผนที่” เฉพาะเมื่อมี pinned_location เท่านั้น
                    const hasPinned =
                        !!job.pinned_location &&
                        Number.isFinite(job.pinned_location.lat) &&
                        Number.isFinite(job.pinned_location.lng);

                    // disabled เฉพาะตอนกำลัง resolve หรือถูก mark ว่าคำนวณ route ไม่ได้
                    const disabled =
                        !hasPinned || resolvingId === job.booking_id || cantRouteIds.has(job.booking_id);

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

                            {/* รายละเอียด + ปุ่ม */}
                            <div className="mt-2">
                                <div className="flex text-base text-[var(--gray-700)]">
                                    <div className="w-[136px]">รหัสคำสั่งซ่อม</div>
                                    <div className="text-[var(--gray-900)] font-medium">{job.order_code}</div>
                                </div>

                                {SubItems}

                                <div className="flex text-base text-[var(--gray-700)]">
                                    <div className="w-[136px]">ราคารวม</div>
                                    <span className="text-[var(--gray-900)] font-medium">
                                        {job.total_price != null ? `${job.total_price.toLocaleString()} ฿` : "—"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 mt-2">
                                    <div className="flex text-base text-[var(--gray-700)]">
                                        <div className="w-[136px]">สถานที่</div>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--gray-900)]">{displayAddress}</span>
                                            <div className="mt-2">
                                                {/* ดูแผนที่ */}
                                                {hasPinned ? (
                                                    <button
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={async () => {
                                                            if (disabled) return;
                                                            // ใช้ pinned_location เป็นปลายทางโดยตรง
                                                            setResolvingId(job.booking_id);
                                                            try {
                                                                const point: GeoPoint = {
                                                                    lat: job.pinned_location!.lat,
                                                                    lng: job.pinned_location!.lng,
                                                                };
                                                                setResolvedDest({
                                                                    point,
                                                                    name: displayAddress,
                                                                });
                                                                setMapJob(job);
                                                                setMapOpen(true);
                                                            } catch {
                                                                const next = new Set(cantRouteIds);
                                                                next.add(job.booking_id);
                                                                setCantRouteIds(next);
                                                            } finally {
                                                                setResolvingId(null);
                                                            }
                                                        }}
                                                        className={`inline-flex items-center gap-1 underline underline-offset-2 ${disabled
                                                            ? "text-gray-400 cursor-not-allowed"
                                                            : "text-[var(--blue-700)] cursor-pointer"
                                                            }`}
                                                        title={disabled ? "ไม่สามารถคำนวณเส้นทางได้" : "ดูแผนที่"}
                                                    >
                                                        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                            <path
                                                                d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                            />
                                                        </svg>
                                                        ดูแผนที่
                                                    </button>
                                                ) : (
                                                    // ไม่มี pinned_location → แสดงเป็นตัวหนังสือธรรมดา (กดไม่ได้)
                                                    <span className="inline-flex items-center gap-1 text-gray-400 select-none">
                                                        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                            <path
                                                                d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                            />
                                                        </svg>
                                                        ดูแผนที่
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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

                {/* Pagination */}
                {total > PAGE_SIZE && (
                    <div className="flex justify-center pt-4">
                        <Pagination
                            prev
                            next
                            first
                            last
                            ellipsis
                            boundaryLinks
                            total={total}
                            limit={PAGE_SIZE}
                            activePage={page}
                            onChangePage={(p) => {
                                setPage(p);
                                // เลื่อนขึ้นหัวตารางอย่างนุ่มๆ
                                const top =
                                    (topRef.current?.getBoundingClientRect().top ?? 0) +
                                    (typeof window !== "undefined" ? window.scrollY : 0) -
                                    2000;
                                if (typeof window !== "undefined") {
                                    window.scrollTo({ top, behavior: "smooth" });
                                }
                            }}
                            size="md"
                        />
                    </div>
                )}
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

            {/* แผนที่ */}
            {mapJob && resolvedDest && (
                <GoogleMapRouteView
                    key={mapJob.booking_id}
                    open={mapOpen}
                    onClose={() => {
                        setMapOpen(false);
                        setMapJob(null);
                        setResolvedDest(null);
                    }}
                    origin={{
                        lat: coords?.lat ?? 13.736717,
                        lng: coords?.lng ?? 100.523186,
                    }}
                    destination={resolvedDest.point}
                    destinationName={resolvedDest.name}
                />
            )}
        </>
    );
}
