import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getService } from "lib/client/servicesApi";
import type { ServiceItem } from "@/types/service";
import Badge from "@/components/admin/services/badge";

import BackHeader from "@/components/admin/common/BackHeader";

export default function ServiceDetailPage() {
    const router = useRouter();
    const id = typeof router.query.id === "string" ? router.query.id : undefined;
    if (!id) return null;

    const [item, setItem] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            try {
                setItem(await getService(id));
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    return (
        <>
            <BackHeader
                subtitle="บริการ"
                title={item?.name ?? "รายละเอียดบริการ"}
                backHref="/admin/services"
                actions={
                    <button
                        onClick={() => router.push(`/admin/services/${id}/edit`)}
                        className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                    >
                        แก้ไข
                    </button>
                }
            />
            {loading && <div className="rounded-2xl border border-gray-100 bg-white p-6">Loading…</div>}
            {!loading && !item && <div className="rounded-2xl border border-gray-100 bg-white p-6">ไม่พบข้อมูล</div>}
            {!loading && item && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                    {/* <div className="mb-5 flex items-center justify-end">
                        <button
                            onClick={() => router.push(`/admin/services/${id}/edit`)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            แก้ไข
                        </button>
                    </div> */}

                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <div className="text-sm text-gray-600">ชื่อบริการ</div>
                            <div className="text-base font-medium text-gray-900">{item.name}</div>
                        </div>

                        {/* (ใช้ Badge) เดี๋ยวทำให้กดหมวดหมู่ได้ รอของคุณ PUI */}
                        <div className="grid gap-2">
                            <div className="text-sm text-gray-600">หมวดหมู่</div>
                            <div><Badge label={item.category} /></div>
                        </div>

                        {/* รูปภาพ (mock) */}
                        <div className="grid gap-2">
                            <div className="text-sm text-gray-600">รูปภาพ</div>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="h-40 w-full max-w-md rounded-xl object-cover" />
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
                                    (ยังไม่มีรูป — mock)
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-200" />

                        <div className="grid gap-3">
                            <div className="text-sm font-medium text-gray-800">รายการบริการย่อย</div>
                            <div className="grid gap-2">
                                {(item.subItems ?? []).sort((a, b) => a.index - b.index).map((s) => (
                                    <div key={s.id} className="grid grid-cols-12 gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm">
                                        <div className="col-span-6">
                                            <div className="text-gray-500">ชื่อรายการ</div>
                                            <div className="font-medium text-gray-900">{s.name}</div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="text-gray-500">หน่วยบริการ</div>
                                            <div className="font-medium text-gray-900">{s.unitName}</div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="text-gray-500">ค่าบริการ / 1 หน่วย</div>
                                            <div className="font-medium text-gray-900">{s.price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
                            <div>
                                <div className="text-gray-500">สร้างเมื่อ</div>
                                <div>{new Date(item.createdAt).toLocaleString("th-TH")}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">แก้ไขล่าสุด</div>
                                <div>{new Date(item.updatedAt).toLocaleString("th-TH")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}