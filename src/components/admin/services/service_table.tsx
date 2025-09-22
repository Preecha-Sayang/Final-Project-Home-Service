import React, { useMemo, useRef } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import Badge from "./badge";
import { ServiceItem } from "../../../types/service";

function formatDT(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit" }).toUpperCase();
    return `${date} ${time}`;
}

type Props = {
    items: ServiceItem[];
    loading?: boolean;
    search?: string;
    onEdit: (item: ServiceItem) => void;
    onDelete: (item: ServiceItem) => void;
    onReorder: (next: ServiceItem[]) => void; // คืนรายการหลังลากจัดลำดับ
};

export default function ServiceTable({
    items, loading = false, search = "", onEdit, onDelete, onReorder,
}: Props) {
    const q = search.trim().toLowerCase();
    const filtered = useMemo(
        () => (q ? items.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) : items),
        [items, q]
    );

    // --- DnD (native HTML5) ---
    const dragSrc = useRef<string | null>(null);

    function onDragStart(e: React.DragEvent<HTMLTableRowElement>, id: string) {
        dragSrc.current = id;
        e.dataTransfer.effectAllowed = "move";
    }
    function onDragOver(e: React.DragEvent<HTMLTableRowElement>) { e.preventDefault(); }
    function onDrop(e: React.DragEvent<HTMLTableRowElement>, targetId: string) {
        e.preventDefault();
        const srcId = dragSrc.current;
        dragSrc.current = null;
        if (!srcId || srcId === targetId) return;

        const arr = [...items];
        const from = arr.findIndex(x => x.id === srcId);
        const to = arr.findIndex(x => x.id === targetId);
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);

        const reIndexed = arr.map((it, i) => ({ ...it, index: i + 1 }));
        onReorder(reIndexed);
    }

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--gray-100)]">
            <table className="w-full table-fixed border-collapse">
                <thead>
                    <tr className="bg-[var(--gray-100)] text-left text-sm text-[var(--gray-600)]">
                        <th className="w-12 px-3 py-3">ลำดับ</th>
                        <th className="w-10 px-3 py-3"></th>
                        <th className="px-3 py-3">ชื่อบริการ</th>
                        <th className="w-40 px-3 py-3">หมวดหมู่</th>
                        <th className="w-44 px-3 py-3">สร้างเมื่อ</th>
                        <th className="w-44 px-3 py-3">แก้ไขล่าสุด</th>
                        <th className="w-20 px-3 py-3 text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {loading && (
                        <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-[var(--gray-500)]">Loading…</td></tr>
                    )}

                    {!loading && filtered.length === 0 && (
                        <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-[var(--gray-500)]">ไม่พบข้อมูล</td></tr>
                    )}

                    {!loading && filtered.map((s) => (
                        <tr key={s.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, s.id)}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, s.id)}
                            className="group border-t border-[var(--gray-100)] text-sm hover:bg-[var(--gray-100)]">
                            <td className="px-3 py-3 text-[var(--gray-600)]">{s.index}</td>
                            <td className="px-3 py-3 text-[var(--gray-400)]"><GripVertical className="h-4 w-4" /></td>
                            <td className="px-3 py-3 font-medium text-[var(--gray-900)]">{s.name}</td>
                            <td className="px-3 py-3"><Badge label={s.category} /></td>
                            <td className="px-3 py-3 text-[var(--gray-700)]">{formatDT(s.createdAt)}</td>
                            <td className="px-3 py-3 text-[var(--gray-700)]">{formatDT(s.updatedAt)}</td>
                            <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--blue-100)] hover:text-[var(--blue-700)]"
                                        title="แก้ไข"
                                        onClick={() => onEdit(s)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--red-100)] hover:text-[var(--red-700)]"
                                        title="ลบ"
                                        onClick={() => onDelete(s)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
