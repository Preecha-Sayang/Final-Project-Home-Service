import React, { useEffect, useState } from "react";
import CategoriesTable from "@/components/admin/__categories_demo/categories_table";
import type { CategoryRow, CategoryListOk } from "@/types/__category";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import { useRouter } from "next/router";

export default function CategoriesPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<CategoryRow[]>([]);
    const [search, setSearch] = useState("");
    const [askDeleteId, setAskDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function fetchList(): Promise<void> {
        setLoading(true);
        const r = await fetch("/api/__categories_demo");
        const d = (await r.json()) as CategoryListOk;
        setItems(d.categories);
        setLoading(false);
    }
    useEffect(() => { void fetchList(); }, []);

    async function handleReorder(next: CategoryRow[]) {
        setItems(next);
        const ids = next.map((x) => x.category_id);
        await fetch("/api/__categories_demo/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });
    }

    async function confirmDelete(): Promise<void> {
        if (askDeleteId == null) return;
        setDeleting(true);
        try {
            const r = await fetch(`/api/__categories_demo/${askDeleteId}`, { method: "DELETE" });
            const d = await r.json();
            if (!r.ok || !d?.ok) throw new Error(d?.message || "Delete failed");
            setItems((arr) => arr.filter((x) => x.category_id !== askDeleteId));
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setDeleting(false);
            setAskDeleteId(null);
        }
    }

    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาหมวดหมู่…"
                    className="h-[40px] w-[360px] rounded border px-3"
                />
                <button
                    className="rounded-lg bg-[var(--blue-600)] px-4 py-2 text-white"
                    onClick={() => router.push("/admin/__categories_demo/new")}
                >
                    เพิ่มหมวดหมู่ +
                </button>
            </div>

            <CategoriesTable
                items={items}
                loading={loading}
                search={search}
                onEdit={(c) => router.push(`/admin/__categories_demo/${c.category_id}/edit`)}
                onDelete={(c) => setAskDeleteId(c.category_id)}
                onReorder={handleReorder}
                onView={(c) => router.push(`/admin/__categories_demo/${c.category_id}`)}
            />

            <ConfirmDialog
                open={askDeleteId != null}
                title="ลบหมวดหมู่?"
                description="การลบจะไม่สามารถย้อนกลับได้"
                loading={deleting}
                onCancel={() => setAskDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
