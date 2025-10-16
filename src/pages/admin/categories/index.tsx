import React, { useEffect, useState } from "react";
import CategoryTable from "@/components/admin/categories/catagory_table";
import type { CategoryRow, CategoryListOk } from "@/types/category";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";

type confirmDel = {
          open: boolean;
          item?: CategoryRow | null;
          loading?: boolean;
};

export default function CategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDel, setConfirmDel] = useState<confirmDel>({
    open: false,
    item: null,
    loading: false,
  })

  async function fetchList(): Promise<void> {
    setLoading(true);
    const r = await fetch("/api/categories");
    const d = (await await r.json()) as CategoryListOk;
    setItems(d.categories);
    setLoading(false);
  }

  useEffect(() => {
    void fetchList();
  }, []);

  async function handleReorder(next: CategoryRow[]) {
    setItems(next);
    const ids = next.map((x) => x.category_id);
    await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  }

  async function handleDelete(item: CategoryRow): Promise<void> {
    setConfirmDel((s) => ({ ...s, loading: true }));
    try {
      const r = await fetch(`/api/categories/${item.category_id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok || !d?.ok) throw new Error(d?.message || "Delete failed");
      setItems((arr) => arr.filter((x) => x.category_id !== item.category_id));
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setConfirmDel({ open: false, item: undefined, loading: false });
    }
  }

  return (
    <>
      <div className="w-full bg-white h-[80px] px-10 py-4 flex items-center justify-between shadow-[0_10px_24px_rgba(0,0,0,.06)]">
        <div className="text-xl font-medium text-[var(--gray-900)]">
          หมวดหมู่
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาหมวดหมู่..."
              className="w-[350px] h-[44px] rounded-lg border border-[var(--gray-300)] px-11 text-sm"
            />
            {/* ไอคอนแว่นขยายด้านขวา */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21L15 15L21 21ZM17 10C17 10.9193 16.8189 11.8295 16.4672 12.6788C16.1154 13.5281 15.5998 14.2997 14.9497 14.9497C14.2997 15.5998 13.5281 16.1154 12.6788 16.4672C11.8295 16.8189 10.9193 17 10 17C9.08075 17 8.1705 16.8189 7.32122 16.4672C6.47194 16.1154 5.70026 15.5998 5.05025 14.9497C4.40024 14.2997 3.88463 13.5281 3.53284 12.6788C3.18106 11.8295 3 10.9193 3 10C3 8.14348 3.7375 6.36301 5.05025 5.05025C6.36301 3.7375 8.14348 3 10 3C11.8565 3 13.637 3.7375 14.9497 5.05025C16.2625 6.36301 17 8.14348 17 10Z"
                  stroke="#CCD0D7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <button
            className="flex justify-center items-center w-[238px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 gap-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
            onClick={() => router.push("/admin/categories/new")}
          >
            เพิ่มหมวดหมู่ <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-8">
        <CategoryTable
          items={items}
          loading={loading}
          search={search}
          onEdit={(c) => router.push(`/admin/categories/${c.category_id}/edit`)}
          onDelete={(c) => setConfirmDel({open: true, item: c, loading: false})}
          onReorder={handleReorder}
          onView={(c) => router.push(`/admin/categories/${c.category_id}`)}
        />
      </div>

      <ConfirmDialog
        open={confirmDel.open}
        title="ยืนยันการลบรายการ?"
        description={
          <>
            {confirmDel && (
              <div className="mt-2 text-base">
                คุณต้องการลบหมวดหมู่ <br />
                <strong className="font-semibold text-xl text-[var(--red)]">
                  ‘{confirmDel.item?.name}’
                </strong>
                <br /> ใช่หรือไม่
              </div>
            )}
          </>
        }
        loading={!!confirmDel.loading}
        onCancel={() => setConfirmDel((s) => ({...s, open: false, item: null }))}
        onConfirm={async () => {
          if (!confirmDel.item) return;
          setConfirmDel((s) => ({ ...s, loading: true }));
          try {
            await handleDelete(confirmDel.item);
          } finally {
            setConfirmDel({ open: false, item: undefined, loading: false });
          }
        }}
      />
    </>
  );
}
