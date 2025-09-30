import React, { useMemo, useRef } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { ServiceItem } from "@/types/service";


function formatDT(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d
    .toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit" })
    .toUpperCase();
  return `${date} ${time}`;
}

type Props = {
  items: ServiceItem[];
  loading?: boolean;
  search?: string;
  onEdit: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
  onReorder: (next: ServiceItem[]) => void;
  onView?: (next: ServiceItem[]) => void
};

export default function CategoryTable({
  items,
  loading = false,
  search = "",
  onEdit,
  onDelete,
  onReorder,
  onView
}: Props) {
  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? items.filter((c) => c.name.toLowerCase().includes(q)) : items),
    [items, q]
  );

  // --- Drag & Drop
  const dragSrc = useRef<string | number>(null);

  function onDragStart(e: React.DragEvent<HTMLTableRowElement>, id: string|number) {
    dragSrc.current = id;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent<HTMLTableRowElement>) {
    e.preventDefault();
  }
  function onDrop(e: React.DragEvent<HTMLTableRowElement>, targetId: string|number) {
    e.preventDefault();
    const srcId = dragSrc.current;
    dragSrc.current = null;
    if (!srcId || srcId === targetId) return;

    const arr = [...items];
    const from = arr.findIndex((x) => x.id === srcId);
    const to = arr.findIndex((x) => x.id === targetId);
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);

    const reIndexed = arr.map((it, i) => ({ ...it, index: i + 1 }));
    onReorder(reIndexed);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-600">
            <th className="w-12 px-3 py-3">ลำดับ</th>
            <th className="w-10 px-3 py-3"></th>
            <th className="px-3 py-3">ชื่อหมวดหมู่</th>
            <th className="w-44 px-3 py-3">สร้างเมื่อ</th>
            <th className="w-44 px-3 py-3">แก้ไขล่าสุด</th>
            <th className="w-20 px-3 py-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {!loading &&
            filtered.map((row) => (
              <tr
                key={row.id}
                draggable
                onDragStart={(e) => onDragStart(e, row.id)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, row.id)}
                className="group border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-3 py-3 text-gray-600">{row.index}</td>
                <td className="px-3 py-3 text-gray-400">
                  <GripVertical className="h-4 w-4 cursor-pointer" />
                </td>
                <td className="px-3 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-3 py-3 text-gray-700">{formatDT(row.createdAt)}</td>
                <td className="px-3 py-3 text-gray-700">{formatDT(row.updatedAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="rounded-md p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                      title="แก้ไข"
                      onClick={() => onEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                      title="ลบ"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* ถ้าไม่มีข้อมูล */}
      {!loading && filtered.length === 0 && (
        <div className="p-6 text-center text-gray-500">ไม่พบหมวดหมู่</div>
      )}
      {loading && (
        <div className="p-6 text-center text-gray-500">กำลังโหลด...</div>
      )}
    </div>
  );
}
