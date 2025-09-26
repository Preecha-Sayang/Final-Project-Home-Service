import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import InputField from "@/components/input/inputField/input_state";
import InputDropdown, { Option } from "@/components/input/inputDropdown/input_dropdown";
import ImageUpload from "@/components/input/inputImageUpload/image_upload";

import type { SubItem } from "@/types/service";
import { getService } from "lib/client/servicesApi";

import { Pool } from "pg";

type Mode = "create" | "edit";
type Props = { mode: Mode; id?: string };

declare global {
  var pgPool: Pool | undefined;
}

// (mock)
const CATEGORY_OPTIONS: Option[] = [
    { label: "บริการทั่วไป", value: "1" },
    { label: "บริการห้องครัว", value: "4" },
    { label: "บริการห้องน้ำ", value: "5" },
];

function emptySub(i: number): SubItem {
    return { id: `tmp-${Date.now()}-${i}`, name: "", unitName: "", price: 0, index: i + 1 };
}

export default function ServiceEditor({ mode, id }: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number>(1);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>(""); // preview ตอนแก้ไข (url เดิมจาก DB)

    const [subItems, setSubItems] = useState<SubItem[]>([emptySub(0), emptySub(1)]);

    // โหลดข้อมูลเดิม (โหมดแก้ไข)
    useEffect(() => {
        if (mode !== "edit" || !id) return;
        (async () => {
            setLoading(true);
            try {
                const s: any = await getService(id);
                setName(s.name ?? s.servicename ?? "");
                setCategoryId(Number(s.category_id ?? 1));
                setImageUrl(s.imageUrl ?? s.image_url ?? "");
                setSubItems(
                    (s.subItems ?? [])
                        .slice()
                        .sort((a: SubItem, b: SubItem) => a.index - b.index)
                        .map((x: SubItem, i: number) => ({ ...x, index: i + 1 }))
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [mode, id]);

    // --- DnD สำหรับรายการย่อย
    const dragSrc = useRef<string | null>(null);
    function onDragStart(e: React.DragEvent<HTMLDivElement>, sid: string) {
        dragSrc.current = sid; e.dataTransfer.effectAllowed = "move";
    }
    function onDragOver(e: React.DragEvent<HTMLDivElement>) { e.preventDefault(); }
    function onDrop(e: React.DragEvent<HTMLDivElement>, targetId: string) {
        e.preventDefault();
        const src = dragSrc.current; dragSrc.current = null;
        if (!src || src === targetId) return;
        const arr = [...subItems];
        const from = arr.findIndex(x => x.id === src);
        const to = arr.findIndex(x => x.id === targetId);
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        setSubItems(arr.map((x, i) => ({ ...x, index: i + 1 })));
    }
    const addRow = () => setSubItems(s => [...s, emptySub(s.length)]);
    const removeRow = (rowId: string) => setSubItems(s => s.filter(x => x.id !== rowId).map((x, i) => ({ ...x, index: i + 1 })));
    const patchRow = (rowId: string, p: Partial<SubItem>) => setSubItems(s => s.map(x => x.id === rowId ? { ...x, ...p } : x));

    // ยิงไป API (POST/PATCH) พร้อมไฟล์ (อัป Cloudinary ตอนกดปุ่ม)
    async function handleSubmit() {
        if (!name.trim()) { alert("กรุณากรอกชื่อบริการ"); return; }
        if (!categoryId) { alert("กรุณาเลือกหมวดหมู่"); return; }

        const fd = new FormData();
        fd.append("servicename", name.trim());
        fd.append("category_id", String(categoryId));
        fd.append("admin_id", "1");
        fd.append("subItems", JSON.stringify(subItems));
        if (!imageFile && imageUrl) fd.append("image_url", imageUrl);
        if (imageFile) fd.append("file", imageFile);

        setSaving(true);
        try {
            if (mode === "create") {
                const res = await fetch("/api/services", { method: "POST", body: fd });
                const data = await res.json();
                if (!res.ok || !data?.ok) throw new Error(data?.message || "Create failed");
                router.push(`/admin/services/${data.service.service_id}/edit`);
            } else {
                if (!id) return;
                const res = await fetch(`/api/services/${id}`, { method: "PATCH", body: fd });
                const data = await res.json();
                if (!res.ok || !data?.ok) throw new Error(data?.message || "Update failed");
                router.push(`/admin/services/${data.service.service_id}/edit`);
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void handleSubmit();
    }

    return (
        <form
            id="service-form"
            onSubmit={onSubmit}
            className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]"
        >
            {loading ? (
                <div className="py-16 text-center text-[var(--gray-500)]">Loading…</div>
            ) : (
                <div className="grid gap-6">
                    <InputField
                        label="ชื่อบริการ *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น ล้างแอร์"
                        validate={(v) => (v.trim() ? null : "กรุณากรอกชื่อบริการ")}
                    />

                    <InputDropdown
                        label="หมวดหมู่*"
                        value={String(categoryId)}
                        onChange={(v) => setCategoryId(Number(v))}
                        options={CATEGORY_OPTIONS}
                        placeholder="เลือกหมวดหมู่"
                    />

                    {/* รูปภาพ */}
                    <div className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--gray-800)]">รูปภาพ</span>
                        {imageUrl && !imageFile ? (
                            <div className="grid gap-2">
                                <img src={imageUrl} alt="" className="h-40 w-full max-w-md rounded-xl object-cover" />
                                {/* ปุ่มนี้แค่เอารูปเดิมออกจาก preview เพื่อเลือกใหม่ การลบของเก่าที่ Cloudinary จะเกิดตอน PATCH หากแนบไฟล์ใหม่ */}
                                <button type="button" className="w-max text-sm text-[var(--blue-600)] hover:underline" onClick={() => setImageUrl("")}>
                                    เลือกรูปใหม่
                                </button>
                            </div>
                        ) : (
                            <ImageUpload value={imageFile} onChange={(f) => setImageFile(f)} label="" className="max-w-xl" />
                        )}
                    </div>

                    <hr className="my-2 border-[var(--gray-200)]" />

                    {/* รายการบริการย่อย (ยังไม่ผูก DB ในตัวอย่างนี้) */}
                    <div className="grid gap-3">
                        <div className="text-sm font-medium text-[var(--gray-800)]">รายการบริการย่อย</div>
                        <div className="grid gap-2">
                            {subItems.map((it) => (
                                <div
                                    key={it.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, it.id)}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, it.id)}
                                    className="grid grid-cols-12 items-center gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-3 cursor-pointer"
                                >
                                    <div className="col-span-1 flex justify-center text-[var(--gray-400)]">
                                        <GripVertical className="h-4 w-4" />
                                    </div>

                                    <div className="col-span-5">
                                        <InputField
                                            placeholder="ชื่อรายการ (เช่น 9,000 - 18,000 BTU, แบบติดผนัง)"
                                            value={it.name}
                                            onChange={(e) => patchRow(it.id, { name: e.target.value })}
                                            validate={(v) => v.trim() ? null : "กรอกชื่อรายการ"}
                                            validateOn="blur"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <InputField
                                            placeholder="หน่วย (เช่น เครื่อง)"
                                            value={it.unitName}
                                            onChange={(e) => patchRow(it.id, { unitName: e.target.value })}
                                            validate={(v) => v.trim() ? null : "กรอกหน่วย"}
                                            validateOn="blur"
                                        />
                                    </div>

                                    <div className="col-span-3">
                                        <InputField
                                            placeholder="ค่าบริการ / 1 หน่วย"
                                            value={String(it.price ?? "")}
                                            onChange={(e) => patchRow(it.id, { price: Number(e.target.value || 0) })}
                                            inputMode="decimal"
                                            rightIcon={<span className="text-[var(--gray-500)]">฿</span>}
                                            validate={(v) => isNaN(Number(v)) ? "ตัวเลขเท่านั้น" : null}
                                            validateOn="blur"
                                        />
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <button type="button" onClick={() => removeRow(it.id)} className="rounded-md p-2 text-[var(--gray-500)] hover:bg-rose-50 hover:text-rose-700 cursor-pointer" title="ลบรายการ">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={addRow} className="mt-1 inline-flex items-center gap-2 self-start rounded-lg border border-[var(--gray-300)] px-3 py-2 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] cursor-pointer">
                            <Plus className="h-4 w-4" /> เพิ่มรายการ
                        </button>
                    </div>

                    <div className="text-right text-sm text-[var(--gray-500)]">
                        {saving ? "กำลังบันทึก..." : ""}
                    </div>
                </div>
            )}
        </form>
    );
}
