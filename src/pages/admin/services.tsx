// ลำดับ | (ไอคอนลาก) | ชื่อบริการ | หมวดหมู่ | สร้างเมื่อ | แก้ไขล่าสุด | Action
import Toolbar from "@/components/admin/services/toolbar";
import ServiceTable from "@/components/admin/services/service_table";
import { ServiceItem } from "@/components/admin/services/type_service";
import { deleteService, listServices, reorderServices } from "@/lib/servicesApi";
import React, { useEffect, useMemo, useState } from "react";

export default function AdminServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const data = await listServices();
                if (alive) setItems(data);
            } finally {
                setLoading(false);
            }
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
        try {
            await deleteService(item.id);
        } catch {
            setItems(prev); // rollback
        }
    }

    return (
        <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
            <Toolbar
                search={search}
                onSearchChange={setSearch}
                onCreate={() => alert("'เพิ่มบริการ'")}
            />

            <ServiceTable
                items={filtered}
                loading={loading}
                search={search}
                onEdit={(item) => alert(`แก้ไข ${item.name}`)}
                onDelete={handleDelete}
                onReorder={handleReorder}
            />
        </div>
    );
}

