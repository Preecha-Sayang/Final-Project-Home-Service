import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import { getService } from "lib/client/servicesApi";
import type { ServiceItem } from "@/types/service";
import Badge from "@/components/admin/services/badge";
import BackHeader from "@/components/admin/common/BackHeader";

import { formatThaiDateTimeAMPM } from "lib/formatDate";

type OptionRow = {
    service_option_id: number;
    name: string;
    unit: string;
    unit_price: number | string;
};

const fmtMoney = (n: number | string) =>
    new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .format(Number(n || 0));

export default function ServiceDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    const [item, setItem] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [options, setOptions] = useState<OptionRow[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // โหลดข้อมูล service หลัก
    useEffect(() => {
        if (!router.isReady) return;
        const sid = typeof id === "string" ? id : undefined;
        if (!sid) return;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const s = await getService(sid);
                setItem(s);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                setError(message || "โหลดข้อมูลล้มเหลว");
                setItem(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [router.isReady, id]);

    // โหลดรายการย่อย (service_option)
    useEffect(() => {
        if (!router.isReady) return;
        const sid = typeof id === "string" ? id : undefined;
        if (!sid) return;

        (async () => {
            setLoadingOptions(true);
            try {
                const r = await fetch(`/api/services/${sid}/options`);
                const d = await r.json();
                if (d?.ok) setOptions(d.options as OptionRow[]);
            } finally {
                setLoadingOptions(false);
            }
        })();
    }, [router.isReady, id]);

    // ลบรายการย่อยแบบ optimistic
    async function removeOption(optId: number) {
        if (!confirm("ยืนยันลบรายการนี้?")) return;

        const prev = options;
        setDeletingId(optId);
        setOptions((p) => p.filter((o) => o.service_option_id !== optId));

        try {
            const res = await fetch(`/api/service-options/${optId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("ลบไม่สำเร็จ");
        } catch (e) {
            // rollback
            setOptions(prev);
            alert((e as Error).message || "ลบไม่สำเร็จ");
        } finally {
            setDeletingId(null);
        }
    }

    const goEdit = () => {
        if (typeof id === "string") router.push(`/admin/services/${id}/edit`);
    };

    return (
        <>
            <BackHeader
                subtitle="บริการ"
                title={item?.name ?? "รายละเอียดบริการ"}
                backHref="/admin/services"
                actions={
                    <button
                        type="button"
                        onClick={goEdit}
                        className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-[var(--gray-100)] hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        แก้ไข
                    </button>
                }
            />

            {loading && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-[var(--gray-100)] p-6">
                    Loading…
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-[var(--gray-100)] p-6 text-[var(--red)]">
                    {error}
                </div>
            )}

            {!loading && !error && !item && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-[var(--gray-100)] p-6">
                    ไม่พบข้อมูล
                </div>
            )}

            {!loading && !error && item && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                    <div className="grid gap-6">
                        {/* ชื่อบริการ */}
                        <div className="grid gap-2">
                            <div className="text-sm text-[var(--gray-600)]">ชื่อบริการ</div>
                            <div className="text-base font-medium text-[var(--gray-900)]">{item.name}</div>
                        </div>

                        {/* หมวดหมู่ */}
                        <div className="grid gap-2">
                            <div className="text-sm text-[var(--gray-600)]">หมวดหมู่</div>
                            <div><Badge label={item.category} /></div>
                        </div>

                        {/* รูปภาพ */}
                        <div className="grid gap-2">
                            <div className="text-sm text-[var(--gray-600)]">รูปภาพ</div>
                            {item.imageUrl ? (
                                <div className="relative h-40 w-full max-w-md overflow-hidden rounded-xl">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name || "image"}
                                        fill
                                        sizes="(max-width:768px) 100vw, 400px"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-[var(--gray-300)] p-10 text-center text-sm text-[var(--gray-400)]">
                                    (ยังไม่มีรูป)
                                </div>
                            )}
                        </div>

                        <hr className="border-[var(--gray-200)]" />

                        {/* รายการบริการย่อย */}
                        <div className="grid gap-3">
                            <div className="text-base font-medium text-[var(--gray-800)]">รายการบริการย่อย</div>

                            {loadingOptions && (
                                <div className="text-sm text-[var(--gray-500)]">กำลังโหลดรายการย่อย…</div>
                            )}

                            {!loadingOptions && options.length === 0 && (
                                <div className="rounded-lg border border-dashed border-[var(--gray-300)] p-4 text-sm text-[var(--gray-500)]">
                                    ยังไม่มีรายการย่อย
                                </div>
                            )}

                            <div className="grid gap-2">
                                {options.map((o) => (
                                    <div key={o.service_option_id} className="grid grid-cols-12  gap-3 rounded-xl  bg-white p-3 text-sm">
                                        <div className="col-span-6">
                                            <div className="py-1 text-[var(--gray-500)]">ชื่อรายการ</div>
                                            <div className="text-base font-medium">{o.name}</div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="py-1 text-[var(--gray-500)]">หน่วย</div>
                                            <div className="text-base font-medium">{o.unit}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="py-1 text-[var(--gray-500)]">ราคา/หน่วย</div>
                                            <div className="text-base font-medium">{fmtMoney(o.unit_price)}</div>
                                        </div>
                                        {/* <div className="col-span-1 flex items-center justify-end">
                                            <button
                                                type="button"
                                                aria-label="ลบรายการย่อย"
                                                onClick={() => removeOption(o.service_option_id)}
                                                disabled={deletingId === o.service_option_id}
                                                className=" w-[122px] h-[44px] rounded-md p-2 text-base font-semibold underline text-[var(--blue-600)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] cursor-pointer"
                                            >
                                                {deletingId === o.service_option_id ? "กำลังลบ..." : "ลบรายการ"}
                                            </button>
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-[var(--gray-300)]" />

                        {/* วันที่ */}
                        <div className="text-base text-[var(--gray-700)]">
                            <div className="flex justify-between items-center w-[387px] h-[44px] gap-4">
                                <div className="text-[var(--gray-500)]">สร้างเมื่อ</div>
                                <div>{formatThaiDateTimeAMPM(item.createdAt)}</div>
                            </div>
                            <div className="flex justify-between items-center w-[387px] h-[44px] gap-4">
                                <div className="flex items-center text-[var(--gray-500)]">แก้ไขล่าสุด</div>
                                <div>{formatThaiDateTimeAMPM(item.updatedAt)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
