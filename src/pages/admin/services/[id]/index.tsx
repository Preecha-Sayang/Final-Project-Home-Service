import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getService } from "lib/client/servicesApi";
import type { ServiceItem } from "@/types/service";
import Badge from "@/components/admin/services/badge";
import BackHeader from "@/components/admin/common/BackHeader";
import { Image } from "lucide-react";

type OptionRow = { service_option_id: number; name: string; unit: string; unit_price: number };



export default function ServiceDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    const [item, setItem] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const goEdit = () => {
        if (typeof id === "string") router.push(`/admin/services/${id}/edit`);
    };

    const [options, setOptions] = useState<OptionRow[]>([]);
    const loadOptions = async (sid: string | number) => {
        const r = await fetch(`/api/services/${sid}/options`);
        const d = await r.json();
        if (d?.ok) setOptions(d.options as OptionRow[]);
    };

    useEffect(() => {
        if (!router.isReady) return;
        const sid = String(router.query.id);
        loadOptions(sid);
    }, [router.isReady, router.query.id]);

    async function removeOption(optId: number) {
        if (!confirm("ลบรายการย่อยนี้?")) return;
        const res = await fetch(`/api/service-options/${optId}`, { method: "DELETE" });
        if (res.ok) setOptions((s) => s.filter(o => o.service_option_id !== optId));
    }

    return (
        <>
            <BackHeader
                subtitle="บริการ"
                title={item?.name ?? "รายละเอียดบริการ"}
                backHref="/admin/services"
                actions={
                    <button
                        onClick={goEdit}
                        className="h-9 rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        แก้ไข
                    </button>
                }
            />

            {loading && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6">
                    Loading…
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 text-[var(--red)]">
                    {error}
                </div>
            )}
            {!loading && !error && !item && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6">
                    ไม่พบข้อมูล
                </div>
            )}

            {!loading && !error && item && (
                <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <div className="text-sm text-[var(--gray-600)]">ชื่อบริการ</div>
                            <div className="text-base font-medium text-gray-900">{item.name}</div>
                        </div>

                        <div className="grid gap-2">
                            <div className="text-sm text-[var(--gray-600)]">หมวดหมู่</div>
                            <div>
                                <Badge label={item.category} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="text-sm text-[var(--gray-600)]">รูปภาพ</div>
                            {item.imageUrl ? (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-40 w-full max-w-md rounded-xl object-cover"
                                />
                            ) : (
                                <div className="rounded-xl border border-dashed border-[var(--gray-300)] p-10 text-center text-sm text-[var(--gray-400)]">
                                    (ยังไม่มีรูป)
                                </div>
                            )}
                        </div>

                        <hr className="border-[var(--gray-200)]" />

                        <div className="grid gap-3">
                            <div className="text-sm font-medium text-[var(--gray-800)]">รายการบริการย่อย</div>

                            <div className="grid gap-2">
                                {options.map(o => (
                                    <div key={o.service_option_id} className="grid grid-cols-12 gap-3 rounded-xl border p-3 text-sm">
                                        <div className="col-span-6">
                                            <div className="text-[var(--gray-500)]">ชื่อรายการ</div>
                                            <div className="font-medium">{o.name}</div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="text-[var(--gray-500)]">หน่วย</div>
                                            <div className="font-medium">{o.unit}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-[var(--gray-500)]">ราคา/หน่วย</div>
                                            <div className="font-medium">{Number(o.unit_price).toFixed(2)}</div>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-end">
                                            <button onClick={() => removeOption(o.service_option_id)} className="rounded-md p-2 text-[var(--gray-500)] hover:bg-rose-50 hover:text-rose-700 cursor-pointer">
                                                ลบ
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-[var(--gray-200)]" />

                        <div className="grid grid-cols-2 gap-6 text-sm text-[var(--gray-700)]">
                            <div>
                                <div className="text-[var(--gray-500)]">สร้างเมื่อ</div>
                                <div>{new Date(item.createdAt).toLocaleString("th-TH")}</div>
                            </div>
                            <div>
                                <div className="text-[var(--gray-500)]">แก้ไขล่าสุด</div>
                                <div>{new Date(item.updatedAt).toLocaleString("th-TH")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}