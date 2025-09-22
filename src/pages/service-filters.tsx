import * as React from "react";
import { FiltersBar, type FiltersState, type Option, toQueryString } from "@/components/filters";
import type { Range } from "@/components/filters/types";

// mock service type
type Service = {
    id: number;
    name: string;
    category: string;
    price: number;
    thumbnail?: string | null;
};

// ตอนนี้ยังไม่เชื่อม DB สามารถ เปลี่ยน fetch('/api/services?...') ได้เลยนะ
async function fetchServicesMock(f: FiltersState): Promise<{ items: Service[]; total: number }> {
    // mockdata งับ
    const all: Service[] = [
        { id: 1, name: "ล้างแอร์", category: "ทั่วไป", price: 900 },
        { id: 2, name: "ซ่อมเครื่องซักผ้า", category: "ห้องน้ำ", price: 1500 },
        { id: 3, name: "ทำหลังคา", category: "หลังคา", price: 1800 },
        { id: 4, name: "ซ่อมท่อน้ำ", category: "ห้องน้ำ", price: 1200 },
    ];

    // filter
    const byQ = (s: Service) => !f.q || s.name.toLowerCase().includes(f.q.toLowerCase());
    const byCat = (s: Service) => !f.category || s.category === f.category;
    const byPrice = (s: Service) => s.price >= f.price.min && s.price <= f.price.max;

    let items = all.filter((s) => byQ(s) && byCat(s) && byPrice(s));
    items = items.sort((a, b) =>
        f.sort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

    // paging (เอาไว้พัฒนาต่อ)
    const total = items.length;
    const page = f.page ?? 1;
    const pageSize = f.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    items = items.slice(start, start + pageSize);

    // จำลองดีเลย์
    await new Promise((r) => setTimeout(r, 500));
    return { items, total };
}

export default function ServiceFiltersPage() {
    const [items, setItems] = React.useState<Service[]>([]);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const categories: Option[] = [
        { label: "บริการทั่วไป", value: "ทั่วไป" },
        { label: "บริการหลังคา", value: "หลังคา" },
        { label: "บริการห้องน้ำ", value: "ห้องน้ำ" },
    ];

    const handleApply = async (f: FiltersState) => {
        setLoading(true);

        // ตอนต่อ Neon แค่สลับไปใช้ fetch จริงครับ
        // const res = await fetch(`/api/services?${toQueryString(f)}`);
        // const data = await res.json();
        // setItems(data.items); setTotal(data.total);

        const data = await fetchServicesMock(f);
        setItems(data.items);
        setTotal(data.total);
        setLoading(false);
    };

    React.useEffect(() => {
        handleApply({
            q: "",
            category: "",
            price: { min: 0, max: 2000 },
            sort: "asc",
            page: 1,
            pageSize: 12,
        });
    }, []);

    return (
        <div className="mx-auto max-w-6xl p-6">
            <h1 className="mb-4 text-xl font-semibold">Service List</h1>
            <FiltersBar
                className="mb-6"
                categories={categories}
                onApply={handleApply}
                defaultFilters={{
                    q: "",
                    category: "",
                    price: { min: 0, max: 2000 },
                    sort: "asc",
                    page: 1,
                    pageSize: 12,
                }}
            />

            {/* แสดงผลลัพธ์ */}
            {loading ? (
                <div className="py-10 text-center text-[var(--gray-600)]">กำลังโหลด…</div>
            ) : (
                <>
                    <div className="mb-3 text-sm text-[var(--gray-600)]">ทั้งหมด {total} รายการ</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((s) => (
                            <div key={s.id} className="rounded-xl border border-[var(--gray-200)] p-4">
                                <div className="text-[var(--gray-900)] font-medium">{s.name}</div>
                                <div className="text-sm text-[var(--gray-600)]">{s.category}</div>
                                <div className="mt-1 text-sm text-[var(--gray-800)]">ราคา {s.price} ฿</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
