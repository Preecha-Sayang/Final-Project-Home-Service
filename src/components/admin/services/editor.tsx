import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import InputField from "@/components/input/inputField/input_state";
import InputDropdown, { Option } from "@/components/input/inputDropdown/input_dropdown";
import ImageUpload from "@/components/input/inputImageUpload/image_upload";

import type { SubItem, ServiceItem, CategoryRow } from "@/types/service";
import { getService, listCategories } from "lib/client/servicesApi";
import ConfirmDialog from "@/components/dialog/confirm_dialog";

type Mode = "create" | "edit";
type Props = { mode: Mode; id?: string };
type UnitOpt = { label: string; value: string };

function emptySub(i: number): SubItem {
    return { id: `tmp-${Date.now()}-${i}`, name: "", unitName: "", price: 0, index: i + 1 };
}

type OptionRow = { service_option_id: number; name: string; unit: string; unit_price: number | string };

////api/units
type UnitsResponseOk = { ok: true; units: { name: string }[] };
type UnitsResponseErr = { ok: false; message?: string };
type UnitsResponse = UnitsResponseOk | UnitsResponseErr;

///api/services/:id/options
type ServiceOptionsResponseOk = { ok: true; options: OptionRow[] };
type ServiceOptionsResponseErr = { ok: false; message?: string };
type ServiceOptionsResponse = ServiceOptionsResponseOk | ServiceOptionsResponseErr;

export default function ServiceEditor({ mode, id }: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number>(1);
    const [catOptions, setCatOptions] = useState<Option[]>([]);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");

    const [subItems, setSubItems] = useState<SubItem[]>([emptySub(0), emptySub(1)]);
    const [basePrice, setBasePrice] = useState<number | null>(null);
    const [description, setDescription] = useState<string>("");

    // options (อยู่หน้าแก้ไขเท่านั้น)
    const [options, setOptions] = useState<OptionRow[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // images
    const [units, setUnits] = useState<UnitOpt[]>([]);
    const [askRemoveImg, setAskRemoveImg] = useState(false);
    const [markRemoveImg, setMarkRemoveImg] = useState(false);

    // โหลด category list
    useEffect(() => {
        (async () => {
            const cats: CategoryRow[] = await listCategories();
            setCatOptions(cats.map((c) => ({ label: c.name, value: String(c.category_id) })));
        })();
    }, []);

    // โหลดหน่วย
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/units");
                const d: UnitsResponse = await r.json();
                if (d.ok) {
                    setUnits(d.units.map((u) => ({ label: u.name, value: u.name })));
                }
            } catch { }
        })();
    }, []);

    // โหลดข้อมูลเดิม
    useEffect(() => {
        if (mode !== "edit" || !id) return;
        (async () => {
            setLoading(true);
            try {
                const s: ServiceItem = await getService(id);
                setName(s.name ?? "");
                setCategoryId(Number(s.categoryId ?? 1));
                setImageUrl(s.imageUrl ?? "");
                setBasePrice((s as Partial<ServiceItem> & { price?: number }).price ?? null); // รองรับกรณีมี price ใน model
                setDescription((s as Partial<ServiceItem> & { description?: string }).description ?? "");

                setSubItems(
                    (s.subItems ?? [])
                        .slice()
                        .sort((a, b) => a.index - b.index)
                        .map((x, i) => ({ ...x, index: i + 1 }))
                );

                // ดึงรายการย่อยจาก API
                setLoadingOptions(true);
                const r = await fetch(`/api/services/${id}/options`);
                const d: ServiceOptionsResponse = await r.json();
                if (d.ok) setOptions(d.options);
            } finally {
                setLoading(false);
                setLoadingOptions(false);
            }
        })();
    }, [mode, id]);

    // ลบ option (อยู่หน้าแก้ไข)
    const removeOption = async (optId: number) => {
        if (!window.confirm("ยืนยันลบรายการย่อยนี้?")) return;
        const prev = options;
        setDeletingId(optId);
        setOptions((o) => o.filter((x) => x.service_option_id !== optId));
        try {
            const res = await fetch(`/api/service-options/${optId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("ลบไม่สำเร็จ");
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : String(e));
            setOptions(prev);
        } finally {
            setDeletingId(null);
        }
    };

    // ลบรูปตอน submit
    function requestRemoveImage() {
        setAskRemoveImg(true);
    }
    function confirmRemoveImage() {
        setAskRemoveImg(false);
        setImageUrl("");
        setImageFile(null);
        setMarkRemoveImg(true);
    }

    // --- DnD ของ subItems
    const dragSrc = useRef<string | null>(null);
    function onDragStart(e: React.DragEvent<HTMLDivElement>, sid: string) {
        dragSrc.current = sid;
        e.dataTransfer.effectAllowed = "move";
    }
    function onDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }
    function onDrop(e: React.DragEvent<HTMLDivElement>, targetId: string) {
        e.preventDefault();
        const src = dragSrc.current;
        dragSrc.current = null;
        if (!src || src === targetId) return;
        const arr = [...subItems];
        const from = arr.findIndex((x) => x.id === src);
        const to = arr.findIndex((x) => x.id === targetId);
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        setSubItems(arr.map((x, i) => ({ ...x, index: i + 1 })));
    }
    const addRow = () => setSubItems((s) => [...s, emptySub(s.length)]);
    const removeRow = (rowId: string) =>
        setSubItems((s) => s.filter((x) => x.id !== rowId).map((x, i) => ({ ...x, index: i + 1 })));
    const patchRow = (rowId: string, p: Partial<SubItem>) =>
        setSubItems((s) => s.map((x) => (x.id === rowId ? { ...x, ...p } : x)));

    // ส่งฟอร์ม (create / edit)
    async function handleSubmit(): Promise<void> {
        if (!name.trim()) {
            alert("กรุณากรอกชื่อบริการ");
            return;
        }
        if (!categoryId) {
            alert("กรุณาเลือกหมวดหมู่");
            return;
        }

        const fd = new FormData();
        fd.append("servicename", name.trim());
        fd.append("category_id", String(categoryId));
        fd.append("admin_id", "1");
        if (basePrice != null) fd.append("price", String(basePrice));
        if (description) fd.append("description", description);
        fd.append("subItems", JSON.stringify(subItems));
        if (!imageFile && imageUrl) fd.append("image_url", imageUrl);
        if (imageFile) fd.append("file", imageFile);
        if (markRemoveImg) fd.append("remove_image", "1"); //เพิ่ม

        setSaving(true);
        try {
            if (mode === "create") {
                const res = await fetch("/api/services", { method: "POST", body: fd });
                const data: { ok: boolean; message?: string; service?: { service_id: number } } = await res.json();
                if (!res.ok || !data?.ok || !data.service) throw new Error(data?.message || "Create failed");
                router.push(`/admin/services/${data.service.service_id}`);
            } else {
                if (!id) return;
                const res = await fetch(`/api/services/${id}`, { method: "PATCH", body: fd });
                const data: { ok: boolean; message?: string; service?: { service_id: number } } = await res.json();
                if (!res.ok || !data?.ok || !data.service) throw new Error(data?.message || "Update failed");
                router.push(`/admin/services/${data.service.service_id}`);
            }
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setSaving(false);
        }
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void handleSubmit();
    }

    const fmtMoney = (n: number | string): string =>
        new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n || 0));

    return (
        <form id="service-form" onSubmit={onSubmit}
            className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
            {loading ? (
                <div className="py-16 text-center text-[var(--gray-500)]">Loading…</div>
            ) : (
                <div className="grid gap-6">

                    {/* เหมือนหน้า preview: ชื่อ/หมวดหมู่/รูป */}
                    <InputField
                        label="ชื่อบริการ *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น ล้างแอร์"
                        validate={(v) => (v.trim() ? null : "กรุณากรอกชื่อบริการ")}
                    />

                    <InputDropdown
                        label="หมวดหมู่ *"
                        value={String(categoryId)}
                        onChange={(v) => setCategoryId(Number(v))}
                        options={catOptions}
                        placeholder="เลือกหมวดหมู่"
                    />

                    <div className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--gray-800)]">รูปภาพ</span>

                        {imageUrl && !imageFile ? (
                            <div className="grid gap-2">
                                <div className="relative h-40 w-full max-w-md overflow-hidden rounded-xl border border-[var(--gray-300)]">
                                    <Image src={imageUrl} alt="service image" fill sizes="(max-width:768px) 100vw, 400px" className="object-cover" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={requestRemoveImage}
                                        className="rounded-md px-3 py-2 text-sm border hover:bg-[var(--gray-100)] cursor-pointer">
                                        ลบรูปภาพ
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-1">
                                <ImageUpload label="รูปบริการ" value={imageFile} onChange={setImageFile} />
                                {!!imageFile && (
                                    <div className="text-xs text-[var(--gray-600)]">
                                        ไฟล์: <span className="font-medium">{imageFile.name}</span>
                                    </div>
                                )}
                                {markRemoveImg && (
                                    <div className="text-xs text-[var(--red)]">จะลบรูปเดิมเมื่อกดบันทึก</div>
                                )}
                            </div>
                        )}
                    </div>

                    <hr className="my-2 border-[var(--gray-200)]" />

                    {/* <InputField
                        label="ราคาเริ่มต้น (ถ้ามี)"
                        placeholder="ระบุเป็นตัวเลข..."
                        value={basePrice == null ? "" : String(basePrice)}
                        onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : null)}
                        inputMode="decimal"
                        rightIcon={<span className="text-[var(--gray-500)]">฿</span>}
                    />

                    <InputField
                        label="รายละเอียด"
                        placeholder="เช่น บริการทำความสะอาดเครื่องปรับอากาศ..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        textarea
                    /> */}

                    {/* รายการย่อยจาก DB: แสดง + ปุ่มลบ (ย้ายมาหน้านี้) */}
                    <div className="grid gap-3">
                        <div className="text-base font-medium text-[var(--gray-800)]">รายการบริการย่อย</div>

                        {loadingOptions && <div className="text-sm text-[var(--gray-500)]">กำลังโหลดรายการย่อย…</div>}

                        {!loadingOptions && options.length === 0 && (
                            <div className="rounded-lg border border-dashed border-[var(--gray-300)] p-4 text-sm text-[var(--gray-500)]">
                                ยังไม่มีรายการย่อย
                            </div>
                        )}

                        <div className="grid gap-2">
                            {options.map((o) => (
                                <div key={o.service_option_id} className="grid grid-cols-12  gap-3 rounded-xl  bg-white p-3 text-sm">
                                    <div className="col-span-6">
                                        <div className="py-1 text-[var(--gray-500)]">ชื่อรายการ</div>
                                        <div className="text-base font-medium">{o.name}</div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="py-1 text-[var(--gray-500)]">หน่วย</div>
                                        <div className="text-base font-medium">{o.unit}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="py-1 text-[var(--gray-500)]">ราคา/หน่วย</div>
                                        <div className="text-base font-medium">{fmtMoney(o.unit_price)}</div>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-end">
                                        <button type="button"
                                            onClick={() => removeOption(o.service_option_id)}
                                            disabled={deletingId === o.service_option_id}
                                            className="w-[112px] rounded-md p-2 text-base font-semibold underline text-[var(--blue-600)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] disabled:opacity-60 cursor-pointer">
                                            {deletingId === o.service_option_id ? "กำลังลบ..." : "ลบรายการ"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ConfirmDialog
                        open={askRemoveImg}
                        title="ลบรูปภาพ?"
                        description="คุณต้องการลบรูปเดิมออกหรือไม่"
                        onCancel={() => setAskRemoveImg(false)}
                        onConfirm={confirmRemoveImage}
                    />

                    {/* subItems (draft ในฟอร์ม) */}
                    {mode === "create" && (
                        <>
                            <hr className="my-2 border-[var(--gray-200)]" />
                            <div className="grid gap-3">
                                <div className="text-sm font-medium text-[var(--gray-800)]">รายการบริการย่อย</div>

                                <div className="grid gap-2">
                                    {subItems.map((it) => (
                                        <div key={it.id}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, it.id)}
                                            onDragOver={onDragOver}
                                            onDrop={(e) => onDrop(e, it.id)}
                                            className="grid grid-cols-12 items-center gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-3 cursor-pointer">
                                            <div className="col-span-1 flex justify-center text-[var(--gray-400)]">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <div className="col-span-5">
                                                <InputField
                                                    placeholder="ชื่อรายการ (เช่น 9,000 - 18,000 BTU, แบบติดผนัง)"
                                                    value={it.name ?? ""}
                                                    onChange={(e) => patchRow(it.id, { name: e.target.value })}
                                                    validate={(v) => v.trim() ? null : "กรอกชื่อรายการ"}
                                                    validateOn="blur"
                                                />
                                            </div>

                                            <InputDropdown
                                                placeholder="เลือกหน่วย"
                                                value={it.unitName ?? ""}
                                                onChange={(v) => patchRow(it.id, { unitName: String(v) })}
                                                options={units}
                                            />
                                            <button
                                                type="button"
                                                className="mt-1 text-xs text-[var(--blue-600)] underline"
                                                onClick={async () => {
                                                    const name = prompt("เพิ่มหน่วยใหม่:");
                                                    if (!name) return;
                                                    const resp = await fetch("/api/units", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
                                                    const d = await resp.json();
                                                    if (d?.ok) {
                                                        setUnits((u) => [...u, { label: name, value: name }]);
                                                        patchRow(it.id, { unitName: name });
                                                    }
                                                }}
                                            >
                                                + เพิ่มหน่วย
                                            </button>

                                            <div className="col-span-3">
                                                <InputField
                                                    placeholder="ค่าบริการ / 1 หน่วย"
                                                    value={it.price == null ? "" : String(it.price)}
                                                    onChange={(e) => patchRow(it.id, { price: Number(e.target.value || 0) })}
                                                    inputMode="decimal"
                                                    rightIcon={<span className="text-[var(--gray-500)]">฿</span>}
                                                    validate={(v) => (v.trim() === "" || isNaN(Number(v)) ? "ตัวเลขเท่านั้น" : null)}
                                                    validateOn="blur"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-end">
                                                <button type="button"
                                                    onClick={() => removeRow(it.id)}
                                                    className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] cursor-pointer"
                                                    title="ลบรายการ">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button"
                                    onClick={addRow}
                                    className="flex justify-center items-center w-[185px] h-[44px] mt-1 gap-2 rounded-lg border border-[var(--blue-600)] px-3 py-2 text-base font-medium text-[var(--blue-600)] hover:text-[var(--gray-100)] hover:bg-[var(--blue-600)] cursor-pointer">
                                    เพิ่มรายการ <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </>
                    )}
                    {saving && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                            <div className="rounded-2xl bg-white px-6 py-5 shadow-lg border border-[var(--gray-100)]">
                                <div className="flex items-center gap-3">
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--blue-600)] border-r-transparent"></span>
                                    <div className="text-sm text-[var(--gray-800)]">กำลังบันทึกข้อมูล…</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </form>
    );
}
