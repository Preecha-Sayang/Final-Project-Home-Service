import React, { useMemo, useRef } from "react";
import { GripVertical } from "lucide-react";
import type { CategoryRow } from "@/types/category";
import { formatThaiDateTimeAMPM } from "lib/formatDate";
import CategoryColorBadge from "./CategoryColorBadge";

{
  /*ต้องสร้าง categoruItem อิงตามตารางใน db*/
}
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
  items = [],
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
    <div className="overflow-hidden  rounded-xl border border-[var(--gray-100)]">
      <table className="w-full table-fixed border-collapse">
        <thead className="font-normal">
          <tr className="bg-[var(--gray-100)] text-sm text-[var(--gray-600)]">
            <th className="w-[56px] px-1 py-3 text-center"></th>
            <th className="w-[58px] px-1 py-3 text-center">ลำดับ</th>
            <th className="px-3 py-1 text-left">ชื่อหมวดหมู่</th>
            <th className="w-[220px] px-1 py-3 text-left">
              สี (พื้นหลัง/ข้อความ/กรอบ)
            </th>
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
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="stroke-[var(--gray-400)] hover:stroke-[var(--red)] transition"
                      >
                        <path
                          d="M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM10 11V17V11ZM14 11V17V11ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z"
                          stroke="#9AA1B0"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--blue-700)] cursor-pointer"
                      title="แก้ไข"
                      onClick={() => onEdit(row)}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="stroke-[var(--blue-600)] hover:stroke-[var(--blue-900)] transition"
                      >
                        <path
                          d="M11 4.99992H6C5.46957 4.99992 4.96086 5.21063 4.58579 5.5857C4.21071 5.96078 4 6.46948 4 6.99992V17.9999C4 18.5304 4.21071 19.0391 4.58579 19.4141C4.96086 19.7892 5.46957 19.9999 6 19.9999H17C17.5304 19.9999 18.0391 19.7892 18.4142 19.4141C18.7893 19.0391 19 18.5304 19 17.9999V12.9999M17.586 3.58592C17.7705 3.3949 17.9912 3.24253 18.2352 3.13772C18.4792 3.0329 18.7416 2.97772 19.0072 2.97542C19.2728 2.97311 19.5361 3.02371 19.7819 3.12427C20.0277 3.22484 20.251 3.37334 20.4388 3.56113C20.6266 3.74891 20.7751 3.97222 20.8756 4.21801C20.9762 4.4638 21.0268 4.72716 21.0245 4.99272C21.0222 5.25828 20.967 5.52072 20.8622 5.76473C20.7574 6.00874 20.605 6.22942 20.414 6.41392L11.828 14.9999H9V12.1719L17.586 3.58592Z"
                          stroke="#9AA1B0"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
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
