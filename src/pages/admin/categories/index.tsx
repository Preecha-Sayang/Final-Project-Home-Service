import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import CategoryTable from "@/components/admin/categories/catagory_table";
import { ServiceItem } from "@/types/service";
import {
  deleteService,
  listServices,
  reorderServices,
} from "lib/client/servicesApi";
import ConfirmDialog from "@/components/dialog/confirm_dialog";

export default function CategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; item?: ServiceItem; loading?: boolean }>({ open: false });

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
    return () => {
      alive = false;
    };
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
      <div className="w-full bg-white rounded-2xl border border-[var(--gray-100)] px-5 py-4 mb-6 flex items-center justify-between">
        <div className="text-xl font-medium text-[var(--gray-900)]">
          หมวดหมู่
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาหมวดหมู่..."
            className="h-9 w-64 rounded-lg border border-[var(--gray-300)] px-3 text-sm"
          />
          <button
            onClick={() => router.push("/admin/categories/new")}
            className="h-9 rounded-lg bg-[var(--blue-600)] px-6 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
          >
            เพื่มหมวดหมู่ +
          </button>
        </div>
      </div>

      {/*TableCard*/}
      <div className="m-6 rounded-2xl border border-[var(--gray-300)] bg-white p-4 shadow">
        <CategoryTable
          items={filtered}
          loading={loading}
          search={search}
          onEdit={(item) => router.push(`/admin/categories/${item.id}/edit`)}
          onDelete={(item) => setConfirmDel({ open: true, item, loading: false})}
          onReorder={handleReorder}
          onView={(item) => router.push(`/admin/categories/${item.id}`)}
        />
      </div>

      <ConfirmDialog
          open={confirmDel.open}
          title="ยืนยันการลบรายการ?"
          description={
            <>คุณต้องการลบรายการ ‘{confirmDel.item?.name}’ ใช่หรือไม่</>
          }
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
