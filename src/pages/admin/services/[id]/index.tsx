import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import ImageLightbox from "@/components/common/Lightbox";

import { getService } from "lib/client/servicesApi";
import type { ServiceItem } from "@/types/service";
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

    const [showImg, setShowImg] = useState(false);

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
                const d: { ok: boolean; options?: OptionRow[] } = await r.json();
                if (d?.ok && d.options) setOptions(d.options);
            } finally {
                setLoadingOptions(false);
            }
        })();
    }, [router.isReady, id]);

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
            <div className="p-8">
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
                    <div className="text-base rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                        <div className="grid gap-6">
                            {/* ชื่อบริการ */}
                            <div className="flex flex-col w-[662px] text-base gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-[229px] font-medium text-[var(--gray-600)]">ชื่อบริการ</div>
                                    <div className="w-[433px] text-[var(--gray-900)]">{item.name}</div>
                                </div>

                                {/* หมวดหมู่ */}
                                <div className="flex items-center gap-2">
                                    <div className="w-[229px] font-medium text-[var(--gray-600)]">หมวดหมู่</div>
                                    <div className="w-[433px]">{item.category}</div>
                                </div>

                                {/* รูปภาพ */}
                                <div className="flex items-start gap-2">
                                    <div className="w-[229px] font-medium text-[var(--gray-600)]">รูปภาพ</div>
                                    {item.imageUrl ? (
                                        <div
                                            className="relative rounded-md h-[200px] w-[433px] overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,.06)] hover:shadow-[0_15px_24px_rgba(0,0,0,.1)] cursor-zoom-in transition"
                                            style={{ width: 300, height: 200 }}
                                            onClick={() => setShowImg(true)}
                                            title="คลิกเพื่อขยาย"
                                        >
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name || "image"}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                            <ImageLightbox
                                                src={item.imageUrl}
                                                alt={item.name || "image"}
                                                open={showImg}
                                                onClose={() => setShowImg(false)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-[var(--gray-300)] p-10 text-center text-sm text-[var(--gray-400)]">
                                            (ยังไม่มีรูป)
                                        </div>
                                    )}
                                </div>
                            </div>


                            <hr className="border-[var(--gray-300)] my-5" />

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
                                        <div key={o.service_option_id} className="grid grid-cols-12  gap-3 rounded-xl  bg-white py-3 text-sm">
                                            <div className="col-span-6">
                                                <div className="py-1 text-[var(--gray-500)]">ชื่อรายการ</div>
                                                <div className="text-base font-medium">{o.name}</div>
                                            </div>
                                            <div className="col-span-3">
                                                <div className="py-1 text-[var(--gray-500)]">หน่วยการบริการ</div>
                                                <div className="text-base font-medium">{o.unit}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="py-1 text-[var(--gray-500)]">ค่าบริการ / 1 หน่วย</div>
                                                <div className="text-base font-medium">{fmtMoney(o.unit_price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-[var(--gray-300)] my-5" />

                            {/* วันที่ */}
                            <div className="text-base text-[var(--gray-700)]">
                                <div className="flex justify-between items-center w-[387px] h-[44px] my-1 gap-4">
                                    <div className="text-[var(--gray-500)]">สร้างเมื่อ</div>
                                    <div>{formatThaiDateTimeAMPM(item.createdAt)}</div>
                                </div>
                                <div className="flex justify-between items-center w-[387px] h-[44px] my-1 gap-4">
                                    <div className="flex items-center text-[var(--gray-500)]">แก้ไขล่าสุด</div>
                                    <div>{formatThaiDateTimeAMPM(item.updatedAt)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
