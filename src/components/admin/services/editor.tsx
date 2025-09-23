//ส่วน แก้ไข/สร้างบริการ
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import InputField from "@/components/input/inputField/input_state";
import InputDropdown, { Option } from "@/components/input/inputDropdown/input_dropdown";
import ImageUpload from "@/components/input/inputImageUpload/image_upload";

import type { ServiceItem, SubItem } from "@/types/service";
import { createService, getService, updateService } from "lib/client/servicesApi";

type Mode = "create" | "edit";
type Props = { mode: Mode; id?: string };

// (mock)
const CATEGORY_OPTIONS: Option[] = [
    { label: "บริการทั่วไป", value: "บริการทั่วไป" },
    { label: "บริการห้องครัว", value: "บริการห้องครัว" },
    { label: "บริการห้องน้ำ", value: "บริการห้องน้ำ" },
];

function emptySub(i: number): SubItem {
    return { id: `tmp-${Date.now()}-${i}`, name: "", unitName: "", price: 0, index: i + 1 };
}
export default function ServiceEditor({ mode, id }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [category, setCategory] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);   // mock
    const [imageUrl, setImageUrl] = useState<string>("");            // mock preview จาก DB (ตอนแก้ไข)
    const [subItems, setSubItems] = useState<SubItem[]>([emptySub(0), emptySub(1)]);

    // สำหรับแก้ไข
    useEffect(() => {
        if (mode !== "edit" || !id) return;
        (async () => {
            setLoading(true);
            try {
                const s = await getService(id);
                setName(s.name);
                setCategory(s.category);
                setImageUrl(s.imageUrl ?? "");
                setSubItems(
                    (s.subItems ?? []).slice().sort((a, b) => a.index - b.index).map((x, i) => ({ ...x, index: i + 1 }))
                );
            } finally { setLoading(false); }
        })();
    }, [mode, id]);

    // สำหรับลากเปลี่ยนรายการย่อย (drag / add / delete / edit)
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

    async function handleSubmit() {
        if (!name.trim()) return alert("กรุณากรอกชื่อบริการ");
        if (!category.trim()) return alert("กรุณาเลือกหมวดหมู่");

        // เดี๋ยวค่อยเอา imageFile ไปอัป Cloudinary แล้วเอา URL มาเซ็ตเป็น imageUrl อีกที **กันลืม
        const body: Partial<ServiceItem> = {
            name: name.trim(),
            category: category.trim(),
            imageUrl: imageUrl || "", // เมื่อทำอัปโหลดจริง ค่อย set
            subItems: subItems.map((x, i) => ({
                id: x.id, name: x.name.trim(),
                unitName: x.unitName.trim(),
                price: Number(x.price || 0),
                index: i + 1,
            })),
        };

        setSaving(true);
        try {
            if (mode === "create") {
                const created = await createService(body);
                router.push(`/admin/services/${created.id}`);
            } else {
                if (!id) return;
                const updated = await updateService(id, body);
                router.push(`/admin/services/${updated.id}`);
            }
        } finally { setSaving(false); }
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
            <div className="mb-5 flex items-center justify-end gap-2">
                <button
                    onClick={() => router.push("/admin/services/page")}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >ยกเลิก</button>
                <button
                    onClick={handleSubmit}
                    disabled={saving || loading}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                >{mode === "create" ? (saving ? "กำลังสร้าง..." : "สร้าง") : (saving ? "กำลังบันทึก..." : "บันทึก")}</button>
            </div>

            {loading ? (
                <div className="py-16 text-center text-gray-500">Loading…</div>
            ) : (
                <div className="grid gap-6">
                    <InputField
                        label="ชื่อบริการ *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น ล้างแอร์"
                        validate={(v) => v.trim() ? null : "กรุณากรอกชื่อบริการ"}
                    />

                    <InputDropdown
                        label="หมวดหมู่ *"
                        value={category}
                        onChange={setCategory}
                        options={CATEGORY_OPTIONS}
                        placeholder="เลือกหมวดหมู่"
                    />

                    {/* รูปภาพ (mock upload) */}
                    <div className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--gray-800)]">รูปภาพ</span>
                        {imageUrl && !imageFile ? (
                            <div className="grid gap-2">
                                {/* ภาพจาก url (mock) ของ next/no-img-element*/}
                                <img src={imageUrl} alt="" className="h-40 w-full max-w-md rounded-xl object-cover" />
                                <button
                                    type="button"
                                    className="w-max text-sm text-blue-600 hover:underline"
                                    onClick={() => setImageUrl("")}
                                >ลบรูปภาพ</button>
                            </div>
                        ) : (
                            <ImageUpload
                                value={imageFile}
                                onChange={(f) => setImageFile(f)}
                                label=""
                                className="max-w-xl"
                            />
                        )}
                    </div>

                    <hr className="my-2 border-gray-200" />

                    {/* รายการบริการย่อย */}
                    <div className="grid gap-3">
                        <div className="text-sm font-medium text-gray-800">รายการบริการย่อย</div>

                        <div className="grid gap-2">
                            {subItems.map((it) => (
                                <div
                                    key={it.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, it.id)}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, it.id)}
                                    className="grid grid-cols-12 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
                                >
                                    <div className="col-span-1 flex justify-center text-gray-400">
                                        <GripVertical className="h-4 w-4" />
                                    </div>

                                    <div className="col-span-5">
                                        <InputField
                                            placeholder="ชื่อรายการ (เช่น 9,000 - 18,000 BTU, แบบติดผนัง)"
                                            value={it.name}
                                            onChange={(e) => patchRow(it.id, { name: e.target.value })}
                                            validate={(v) => v.trim() ? null : "กรอกชื่อรายการ"}
                                            validateOn="change"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <InputField
                                            placeholder="หน่วย (เช่น เครื่อง)"
                                            value={it.unitName}
                                            onChange={(e) => patchRow(it.id, { unitName: e.target.value })}
                                            validate={(v) => v.trim() ? null : "กรอกหน่วย"}
                                            validateOn="change"
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
                                            validateOn="change"
                                        />
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(it.id)}
                                            className="rounded-md p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-700"
                                            title="ลบรายการ"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addRow}
                            className="mt-1 inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Plus className="h-4 w-4" /> เพิ่มรายการ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}