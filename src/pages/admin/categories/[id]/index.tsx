import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getService } from "lib/client/servicesApi";
import type { ServiceItem } from "@/types/service";
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
                subtitle=""
                title={item?.name ?? "เพิ่มหมวดหมู่"}
                backHref="/admin/services"
                actions={
                    <button
                        onClick={() => router.push(`/admin/services/${id}/edit`)}
                        className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        แก้ไข
                    </button>
                }
            />
            {loading && <div className="rounded-2xl border border-gray-100 bg-white p-6">Loading…</div>}
            {!loading && !item && <div className="rounded-2xl border border-gray-100 bg-white p-6">ไม่พบข้อมูล</div>}
            {!loading && item && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                  

                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <div className="text-sm text-gray-600">ชื่อหมวดหมู่</div>
                            <div className="text-base font-medium text-gray-900">{item.name}</div>
                        </div>

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