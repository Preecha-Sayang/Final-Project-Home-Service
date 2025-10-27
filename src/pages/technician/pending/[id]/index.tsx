import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import BackHeader from "@/components/technician/common/BackHeader";
import { formatThaiDateTimeText } from "lib/client/date/thai";
import type { AddressData } from "@/types/address";
import type { GeoPoint } from "@/types/location";
import dynamic from "next/dynamic";

const GoogleMapRouteView = dynamic(
    () => import("@/components/location/GoogleMapRouteView"),
    { ssr: false }
);

type Head = {
    booking_id: number;
    order_code: string;
    status_id: number;
    service_date: string | null;
    service_time: string | null;
    address_data: AddressData | null;
    pinned_location: (GeoPoint & { place_name?: string }) | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    total_price: number;
};

type Item = {
    booking_item_id: number;
    servicename: string;
    option_name: string | null;
    quantity: number;
    unit: string | null;
    price: number;
    category_name?: string | null;
};

export default function TechnicianPendingDetail() {
    const router = useRouter();
    const rawId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    const id = Number(rawId);

    const [head, setHead] = useState<Head | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

    // map popup state (เหมือนในตาราง)
    const [mapOpen, setMapOpen] = useState(false);
    const [resolvedDest, setResolvedDest] = useState<{ point: GeoPoint; name: string } | null>(null);
    const [origin, setOrigin] = useState<GeoPoint | null>(null);

    async function load() {
        if (!Number.isFinite(id) || id <= 0) return;
        setLoading(true);
        setErrMsg("");
        try {
            const res = await fetch(`/api/technician/jobs/${id}`, { cache: "no-store" });
            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                setErrMsg(e?.message || "โหลดข้อมูลไม่สำเร็จ");
                setHead(null);
                setItems([]);
                return;
            }
            const data = await res.json();
            setHead(data.head ?? null);
            setItems(Array.isArray(data.items) ? data.items : []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!router.isReady) return;
        load();

        // origin (ตำแหน่งช่าง)
        if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setOrigin({ lat: 13.736717, lng: 100.523186 }),
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            setOrigin({ lat: 13.736717, lng: 100.523186 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, id]);

    // เสร็จสิ้น / ปฏิเสธคืนคิว
    async function post(url: string) {
        const res = await fetch(url, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok) {
            router.push("/technician/pending");
        } else {
            alert(data?.message || "อัปเดตสถานะไม่สำเร็จ");
            load();
        }
    }
    const complete = () => post(`/api/technician/jobs/${id}/complete`);
    const decline = () => post(`/api/technician/jobs/${id}/decline`);

    // ---- ที่อยู่จาก address_data แบบครบถ้วน (ไม่อิง place_name) ----
    const addressText = useMemo(() => {
        const a = head?.address_data;
        if (!a) return "";
        // key ตามข้อมูลจริงใน DB: address, subdistrict, district, province, additional_info
        const parts = [a.address, a.subdistrict, a.district, a.province]
            .map((s) => (s || "").trim())
            .filter(Boolean);
        const base = parts.join(" ");
        const extra = (a as any).additional_info ? String((a as any).additional_info).trim() : "";
        return extra ? `${base} ${extra}` : base;
    }, [head?.address_data]);

    const hasPinned =
        !!head?.pinned_location &&
        Number.isFinite(head.pinned_location.lat) &&
        Number.isFinite(head.pinned_location.lng);

    // เปิด popup แผนที่ (สไตล์ปุ่มให้เหมือนตัวอย่าง)
    const openMap = async () => {
        if (!hasPinned) return;
        const point: GeoPoint = {
            lat: head!.pinned_location!.lat,
            lng: head!.pinned_location!.lng,
        };
        // ใช้ address_data เป็นชื่อปลายทางหลัก
        setResolvedDest({ point, name: addressText || "ปลายทาง" });
        setMapOpen(true);
    };

    const title = items.length > 0 ? items[0]?.servicename || "รายละเอียดงาน" : "รายละเอียดงาน";
    const apptText = formatThaiDateTimeText(head?.service_date ?? null, head?.service_time ?? null);

    const category = (items[0]?.category_name ?? "").trim() || "ไม่ระบุ";

    return (
        <>
            <BackHeader title={title} onBack={() => router.back()} />
            <div className="p-6">
                {loading ? (
                    <div className="p-6 text-base text-[var(--gray-500)]">กำลังโหลด...</div>
                ) : errMsg ? (
                    <div className="p-6 text-base text-[var(--gray-500)]">{errMsg}</div>
                ) : !head ? (
                    <div className="p-6 text-base text-[var(--gray-500)]">ไม่พบข้อมูล</div>
                ) : (
                    <div className="rounded-xl border bg-white p-6">
                        <div className="mb-4 text-xl font-semibold">{items[0]?.servicename || "งานบริการ"}</div>

                        <div className="gap-6">
                            <div className="md:col-span-7">
                                <div className="flex flex-col space-y-2 text-base gap-6">
                                    <div className="flex items-center">
                                        <span className="w-[205px] text-[var(--gray-500)]">หมวดหมู่</span>
                                        <span className="inline-flex items-center h-[30px] rounded-md border border-blue-200 bg-blue-50 px-3 py-[3px] text-ms font-medium text-blue-700">
                                            {category}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <div className="w-[205px] text-[var(--gray-500)]">รายการ: </div>
                                        <div>
                                            <ul className="min-w-0 list-disc pl-5 space-y-1">
                                                {items.map((it, idx) => (
                                                    <li key={idx}>
                                                        {`${it.servicename}${it.option_name ? ` (${it.option_name})` : ""} ×${it.quantity}${it.unit ? ` ${it.unit}` : ""
                                                            }`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                    </div>
                                    <div className="flex">
                                        <div className="w-[205px] text-[var(--gray-500)]">วันเวลานัดหมาย: </div>
                                        <div>
                                            {apptText || "-"}
                                        </div>

                                    </div>

                                    {/* ที่อยู่ + ปุ่มดูแผนที่ (style เหมือนตัวอย่าง) */}
                                    <div className="flex">
                                        <div className="w-[205px] text-[var(--gray-500)]">สถานที่: </div>
                                        <div className="min-w-0">
                                            {addressText || "-"}
                                            <div className="mt-1">
                                                {hasPinned ? (
                                                    <button
                                                        type="button"
                                                        onClick={openMap}
                                                        className="inline-flex items-center gap-1 underline underline-offset-2 text-[var(--blue-700)] cursor-pointer"
                                                        title="ดูแผนที่"
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
                                                    <span className="inline-flex items-center gap-1 text-gray-400 select-none" title="ไม่มีพิกัดปลายทาง">
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


                                    <div className="flex">
                                        <span className="w-[205px] text-[var(--gray-500)]">รหัสคำสั่งซ่อม: </span>
                                        {head.order_code}
                                    </div>
                                    <div className="flex">
                                        <span className="w-[205px] text-[var(--gray-500)]">ราคาสุทธิ: </span>
                                        {head.total_price.toFixed(2)} ฿
                                    </div>
                                    <div className="flex">
                                        <span className="w-[205px] text-[var(--gray-500)]">ผู้รับบริการ: </span>
                                        {head.customer_name ?? "-"}
                                    </div>
                                    <div className="flex">
                                        <span className="w-[205px] text-[var(--gray-500)]">เบอร์ติดต่อ: </span>
                                        {head.customer_phone ?? "-"}
                                    </div>
                                </div>

                                {/* ปุ่มสถานะ: เสร็จสิ้น / ปฏิเสธ-คืนคิว */}
                                <div className="mt-10 flex justify-center gap-2">
                                    <button
                                        onClick={decline}
                                        className="h-[44px] rounded-lg text-red-600 border border-red-300 px-4 py-2 text-base hover:bg-gray-50 cursor-pointer"
                                    >
                                        ปฏิเสธ
                                    </button>
                                    <button
                                        onClick={complete}
                                        className="h-[44px] rounded-lg bg-emerald-600 px-4 py-2 text-base text-white hover:bg-emerald-700 cursor-pointer"
                                    >
                                        ดำเนินการสำเร็จ
                                    </button>
                                </div>
                            </div>
                            {/* ไม่มีส่วนประวัติการเปลี่ยนสถานะ ตามที่ขอ */}
                        </div>
                    </div>
                )}
            </div>

            {mapOpen && resolvedDest && (
                <GoogleMapRouteView
                    key={head?.booking_id ?? "map"}
                    open={mapOpen}
                    onClose={() => {
                        setMapOpen(false);
                        setResolvedDest(null);
                    }}
                    origin={{
                        lat: origin?.lat ?? 13.736717,
                        lng: origin?.lng ?? 100.523186,
                    }}
                    destination={resolvedDest.point}
                    destinationName={resolvedDest.name}
                />
            )}
        </>
    );
}
