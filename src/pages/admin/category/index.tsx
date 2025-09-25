import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import CategoryTable from "@/components/admin/categories/catagory_table";
import { ServiceItem } from "@/types/service";
import {
  deleteService,
  listServices,
  reorderServices,
} from "lib/client/servicesApi";


export default function CategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ServiceItem[]>([]);

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
    return items.filter((s) => s.name.toLowerCase().includes(q));
  }, [items, search]);

  {
    /*ต้องมีการยิง api*/
  }
  async function handleReorder(next: ServiceItem[]) {
    setItems(next);
    try {
      await reorderServices(next.map((x) => ({ id: x.id, index: x.index })));
    } catch {
      // ปล่อยว่างก่อน
    }
  }

  // ลบ
  async function handleDelete(item: ServiceItem) {
    const prev = items;
    setItems(
      items
        .filter((x) => x.id !== item.id)
        .map((x, i) => ({ ...x, index: i + 1 }))
    );
    try {
      await deleteService(item.id);
    } catch {
      setItems(prev);
    }
  }

  return (
    <>
      {/*header*/}
      <div className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <span className="text-xl font-medium text-gray-900">หมวดหมู่</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาบริการ..."
            className="h-9 w-64 rounded-lg border border-gray-300 px-3 text-sm"
          />
          <button
            onClick={() => router.push("/admin/categories/create")}
            className="h-9 rounded-lg bg-[var(--blue-600)] cursor-pointer px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)]"
          >
            เพิ่มหมวดหมู่ +
          </button>
        </div>
      </div>

      {/*TableCard*/}
      <div className="m-6 rounded-2xl border border-[var(--gray-300)] bg-white p-4 shadow">
        <CategoryTable
          items={filtered}
          search={search}
          onEdit={(item) => alert("แก้ไข " + item.name)}
          onDelete={(item) => alert("ลบ " + item.name)}
          onReorder={handleReorder}
        />
      </div>
    </>
  );
}
