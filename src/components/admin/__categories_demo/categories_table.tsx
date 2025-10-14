import React, { useMemo, useRef } from "react";
import { GripVertical } from "lucide-react";
import type { CategoryRow } from "@/types/__category";
import { formatThaiDateTimeAMPM } from "lib/formatDate";
import CategoryColorBadge from "./CategoryColorBadge";

type Props = {
    items: CategoryRow[];
    loading?: boolean;
    search?: string;
    onEdit: (row: CategoryRow) => void;
    onDelete: (row: CategoryRow) => void;
    onReorder: (next: CategoryRow[]) => void;
    onView?: (row: CategoryRow) => void;
};

export default function CategoriesTable({
    items,
    loading = false,
    search = "",
    onEdit,
    onDelete,
    onReorder,
    onView,
}: Props) {
    const q = search.trim().toLowerCase();

    const filtered = useMemo(() => {
        if (!q) return items;
        return items.filter((c) => c.name.toLowerCase().includes(q));
    }, [items, q]);

    // DnD
    const dragSrc = useRef<number | null>(null);
    function onDragStart(e: React.DragEvent<HTMLTableRowElement>, id: number) {
        dragSrc.current = id;
        e.dataTransfer.effectAllowed = "move";
    }
    function onDragOver(e: React.DragEvent<HTMLTableRowElement>) {
        e.preventDefault();
    }
    function onDrop(e: React.DragEvent<HTMLTableRowElement>, targetId: number) {
        e.preventDefault();
        const srcId = dragSrc.current;
        dragSrc.current = null;
        if (!srcId || srcId === targetId) return;

        const arr = [...items];
        const from = arr.findIndex((x) => x.category_id === srcId);
        const to = arr.findIndex((x) => x.category_id === targetId);
        if (from === -1 || to === -1) return;

        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        const reIndexed = arr.map((it, i) => ({ ...it, position: i + 1 }));
        onReorder(reIndexed);
    }

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--gray-100)]">
            <table className="w-full table-fixed border-collapse">
                <thead className="font-normal">
                    <tr className="bg-[var(--gray-100)] text-sm text-[var(--gray-600)]">
                        <th className="w-[56px] px-1 py-3 text-center"></th>
                        <th className="w-[58px] px-1 py-3 text-center">ลำดับ</th>
                        <th className="px-3 py-1 text-left">ชื่อหมวดหมู่</th>
                        <th className="w-[220px] px-1 py-3 text-left">สี</th>
                        <th className="w-[200px] px-1 py-3 text-left">สร้างเมื่อ</th>
                        <th className="w-[200px] px-1 py-3 text-left">แก้ไขล่าสุด</th>
                        <th className="w-[120px] px-1 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {!loading &&
                        filtered.map((row) => (
                            <tr
                                key={row.category_id}
                                draggable
                                onDragStart={(e) => onDragStart(e, row.category_id)}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, row.category_id)}
                                className="group border-t border-[var(--gray-100)] text-sm hover:bg-[var(--gray-100)]"
                            >
                                <td className="px-5 py-3 text-center text-[var(--gray-400)]">
                                    <GripVertical className="h-4 w-4 cursor-pointer" />
                                </td>
                                <td className="px-1 py-3 text-center text-[var(--gray-600)]">
                                    {row.position}
                                </td>
                                <td className="px-3 py-3 font-medium text-[var(--gray-900)]">
                                    {onView ? (
                                        <button
                                            type="button"
                                            onClick={() => onView(row)}
                                            className="text-left hover:underline decoration-[var(--gray-400)] cursor-pointer"
                                        >
                                            {row.name}
                                        </button>
                                    ) : (
                                        row.name
                                    )}
                                </td>
                                <td className="px-1 py-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="inline-block h-5 w-8 rounded"
                                            style={{ backgroundColor: row.bg_color_hex }}
                                        />
                                        <span
                                            className="inline-block h-5 w-8 rounded border"
                                            style={{ backgroundColor: row.text_color_hex }}
                                            title="text sample"
                                        />
                                        <CategoryColorBadge
                                            bg={row.bg_color_hex}
                                            text={row.text_color_hex}
                                            ring={row.ring_color_hex}
                                        />
                                    </div>
                                </td>
                                <td className="px-1 py-3 text-[var(--gray-700)]">
                                    {formatThaiDateTimeAMPM(row.create_at)}
                                </td>
                                <td className="px-1 py-3 text-[var(--gray-700)]">
                                    {formatThaiDateTimeAMPM(row.update_at)}
                                </td>
                                <td className="px-1 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] cursor-pointer"
                                            title="ลบ"
                                            onClick={() => onDelete(row)}
                                        >
                                            🗑️
                                        </button>
                                        <button
                                            className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--blue-700)] cursor-pointer"
                                            title="แก้ไข"
                                            onClick={() => onEdit(row)}
                                        >
                                            ✏️
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
