// ลำดับ | (ไอคอนลาก) | ชื่อบริการ | หมวดหมู่ | สร้างเมื่อ | แก้ไขล่าสุด | Action
import ServiceTable from "@/components/admin/services/service_table";
import { ServiceItem } from "@/types/service";
import { deleteService, listServices, reorderServices } from "lib/client/servicesApi";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import ConfirmDialog from "@/components/dialog/confirm_dialog";

export default function AdminServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [confirmDel, setConfirmDel] = useState<{ open: boolean; item?: ServiceItem; loading?: boolean }>({ open: false });
    const router = useRouter();

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const data = await listServices();
                if (alive) setItems(data);
            } finally { setLoading(false); }
        })();
        return () => { alive = false; };
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }, [items, search]);

    // ลากจัดเรียง → อัปเดต state + ยิง API
    async function handleReorder(next: ServiceItem[]) {
        setItems(next);
        try {
            await reorderServices(next.map(x => ({ id: x.id, index: x.index })));
        } catch {
            // ปล่อยว่างก่อน
        }
    }

    // ลบ
    async function handleDelete(item: ServiceItem) {
        const prev = items;
        setItems(items.filter(x => x.id !== item.id).map((x, i) => ({ ...x, index: i + 1 })));
        try { await deleteService(item.id); } catch { setItems(prev); }
    }

    return (
        <>
            <div className="w-full bg-white rounded-2xl border border-[var(--gray-100)] px-5 py-4 mb-6 flex items-center justify-between">
                <div className="text-xl font-medium text-[var(--gray-900)]">รายการ</div>
                <div className="flex items-center gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาบริการ..."
                        className="h-9 w-64 rounded-lg border border-[var(--gray-300)] px-3 text-sm"
                    />
                    <button
                        onClick={() => router.push("/admin/services/new")}
                        className="h-9 rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        + เพิ่มบริการ
                    </button>
                </div>
            </div>


            <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                <ServiceTable
                    items={filtered}
                    loading={loading}
                    search={search}
                    onEdit={(item) => router.push(`/admin/services/${item.id}/edit`)}
                    onDelete={(item) => setConfirmDel({ open: true, item, loading: false })}
                    onReorder={handleReorder}
                    onView={(item) => router.push(`/admin/services/${item.id}`)}
                />
            </div>

            <ConfirmDialog
                open={confirmDel.open}
                title="ยืนยันการลบรายการ?"
                description={<>คุณต้องการลบรายการ ‘{confirmDel.item?.name}’ ใช่หรือไม่</>}
                loading={!!confirmDel.loading}
                onCancel={() => setConfirmDel({ open: false })}
                onConfirm={async () => {
                    if (!confirmDel.item) return;
                    setConfirmDel((s) => ({ ...s, loading: true }));
                    await handleDelete(confirmDel.item);
                    setConfirmDel({ open: false, item: undefined, loading: false });
                }}
            />
        </>
    );
}
