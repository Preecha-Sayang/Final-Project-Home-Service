import { useState } from "react";
import type { CategoryRow } from "@/types/service";

type Props = {
    mode: "create" | "edit";
    initial?: CategoryRow;
    onSaved?: (row: CategoryRow) => void;
};

export default function CategoryForm({ mode, initial, onSaved }: Props) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [bg, setBg] = useState(initial?.bg_color_hex ?? "#EFF6FF");
    const [text, setText] = useState(initial?.text_color_hex ?? "#1D4ED8");
    const [ring, setRing] = useState(initial?.ring_color_hex ?? "#BFDBFE");
    const [saving, setSaving] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const body = { name, description, bg_color_hex: bg, text_color_hex: text, ring_color_hex: ring };
            const url = mode === "create" ? "/api/categories" : `/api/categories/${initial?.category_id}`;
            const method = mode === "create" ? "POST" : "PATCH";
            const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const d = await r.json();
            if (!r.ok || !d?.ok) throw new Error(d?.message || "save failed");
            onSaved?.(d.category as CategoryRow);
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : String(e));
        } finally { setSaving(false); }
    }

    return (
        <form onSubmit={submit} className="grid gap-4 max-w-xl">
            <label className="grid gap-1">
                <span className="text-sm font-medium">ชื่อหมวดหมู่ *</span>
                <input className="h-10 rounded border px-3" value={name} onChange={e => setName(e.target.value)} required />
            </label>

            <label className="grid gap-1">
                <span className="text-sm font-medium">รายละเอียด</span>
                <textarea className="min-h-[90px] rounded border px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
            </label>

            <div className="grid grid-cols-3 gap-4">
                <label className="grid gap-1">
                    <span className="text-sm font-medium">พื้นหลัง</span>
                    <input type="color" value={bg} onChange={e => setBg(e.target.value)} />
                    <input className="h-9 rounded border px-2" value={bg} onChange={e => setBg(e.target.value)} />
                </label>
                <label className="grid gap-1">
                    <span className="text-sm font-medium">ตัวอักษร</span>
                    <input type="color" value={text} onChange={e => setText(e.target.value)} />
                    <input className="h-9 rounded border px-2" value={text} onChange={e => setText(e.target.value)} />
                </label>
                <label className="grid gap-1">
                    <span className="text-sm font-medium">เส้นขอบ</span>
                    <input type="color" value={ring} onChange={e => setRing(e.target.value)} />
                    <input className="h-9 rounded border px-2" value={ring} onChange={e => setRing(e.target.value)} />
                </label>
            </div>

            <div
                className="rounded-md px-3 py-2 w-max"
                style={{ backgroundColor: bg, color: text, boxShadow: `inset 0 0 0 1px ${ring}` }}
            >
                ตัวอย่างป้าย
            </div>

            <button type="submit" disabled={saving} className="h-10 rounded bg-[var(--blue-600)] text-white px-4 disabled:opacity-60">
                {saving ? "กำลังบันทึก..." : mode === "create" ? "สร้างหมวดหมู่" : "บันทึกการแก้ไข"}
            </button>
        </form>
    );
}
