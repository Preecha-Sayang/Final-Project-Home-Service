import React, { useEffect, useState } from "react";
import type {
  HexColor,
  CategoryCreateInput,
  CategoryRow,
} from "@/types/category";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "lib/client/categoriesApi";
import { useRouter } from "next/router";

type Mode = "create" | "edit";
type Props = { mode: Mode; id?: number };

const adminId = 1; // หรือดึงจาก auth

function isHexColor(v: string): v is HexColor {
  return /^#[0-9A-Fa-f]{3,8}$/.test(v);
}

export default function CategoryEditor({ mode, id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [bg, setBg] = useState<HexColor>("#EFF6FF");
  const [text, setText] = useState<HexColor>("#1D4ED8");
  const [ring, setRing] = useState<HexColor>("#BFDBFE");

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    (async () => {
      setLoading(true);
      try {
        const c: CategoryRow = await getCategory(id);
        setName(c.name);
        setBg(c.bg_color_hex);
        setText(c.text_color_hex);
        setRing(c.ring_color_hex);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, id]);

  async function submit() {
    if (!name.trim()) {
      alert("กรอกชื่อหมวดหมู่");
      return;
    }
    if (!isHexColor(bg) || !isHexColor(text) || !isHexColor(ring)) {
      alert("ค่าสีไม่ถูกต้อง");
      return;
    }
    setSaving(true);
    try {
      const payload: CategoryCreateInput = {
        name: name.trim(),
        bg_color_hex: bg,
        text_color_hex: text,
        ring_color_hex: ring,
        admin_id: adminId,
      };
      if (mode === "create") {
        const created = await createCategory({
          name: name.trim(),
          bg_color_hex: bg,
          text_color_hex: text,
          ring_color_hex: ring,
          admin_id: adminId,
        });
        router.push(`/admin/__categories_demo/${created.category_id}`);
      } else {
        const updated = await updateCategory(id!, {
          name: name.trim(),
          bg_color_hex: bg,
          text_color_hex: text,
          ring_color_hex: ring,
        });
        router.push(`/admin/__categories_demo/${updated.category_id}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-sm">
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-2">ชื่อหมวดหมู่ *</div>
            <div className="col-span-10">
              <input
                className="h-10 w-full rounded border px-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="เช่น บริการทั่วไป"
              />
            </div>
          </div>

          {/* สี */}
          <div className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-2">พื้นหลัง (bg) *</div>
            <div className="col-span-10 flex items-center gap-3">
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value as HexColor)}
              />
              <input
                className="h-10 rounded border px-3 w-40"
                value={bg}
                onChange={(e) => setBg(e.target.value as HexColor)}
              />
              <div
                className="h-8 w-16 rounded"
                style={{ backgroundColor: bg }}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-2">ตัวอักษร (text) *</div>
            <div className="col-span-10 flex items-center gap-3">
              <input
                type="color"
                value={text}
                onChange={(e) => setText(e.target.value as HexColor)}
              />
              <input
                className="h-10 rounded border px-3 w-40"
                value={text}
                onChange={(e) => setText(e.target.value as HexColor)}
              />
              <div
                className="h-8 w-16 rounded border"
                style={{ backgroundColor: text }}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-2">เส้นขอบ (ring) *</div>
            <div className="col-span-10 flex items-center gap-3">
              <input
                type="color"
                value={ring}
                onChange={(e) => setRing(e.target.value as HexColor)}
              />
              <input
                className="h-10 rounded border px-3 w-40"
                value={ring}
                onChange={(e) => setRing(e.target.value as HexColor)}
              />
              <div
                className="h-8 w-16 rounded"
                style={{ boxShadow: `0 0 0 3px ${ring}` }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border px-4 py-2"
              onClick={() => router.back()}
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="rounded-lg bg-[var(--blue-600)] px-4 py-2 text-white disabled:opacity-60"
              onClick={submit}
              disabled={saving}
            >
              {saving ? "กำลังบันทึก…" : mode === "create" ? "สร้าง" : "บันทึก"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
