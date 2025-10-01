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
import InputDialog from "@/components/dialog/input_dialog";

type Mode = "create" | "edit";
type Props = { mode: Mode; id?: string };
type UnitOpt = { label: string; value: string };

function emptySub(i: number): SubItem {
    return { id: `tmp-${Date.now()}-${i}`, name: "", unitName: "", price: 0, index: i + 1 };
}

type OptionRow = {
    service_option_id: number; // ใหม่ยังไม่มี
    name: string;
    unit: string;
    unit_price: string; // เก็บเป็น string เพื่อ bind กับ input ได้เนียน
    _tmpId?: string;     // local key สำหรับแถวใหม่
};

////api/units
type UnitsResponseOk = { ok: true; units: string[] };
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
    const [categoryId, setCategoryId] = useState<number>(0);
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

    // เพิ่มหน่วย
    const [addUnitOpen, setAddUnitOpen] = useState(false);
    const [addUnitForRowId, setAddUnitForRowId] = useState<string | null>(null);
    const [addingUnit, setAddingUnit] = useState(false);

    // ยืนยันลบ option
    const [askDelOptionId, setAskDelOptionId] = useState<number | null>(null);

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
                const r = await fetch("/api/service-options/units");
                const d: UnitsResponse = await r.json();
                if (d?.ok) setUnits(d.units.map(u => ({ label: u, value: u })));
            } catch { /* ignore */ }
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

    // ลบ option (ยืนยันด้วย ConfirmDialog)
    const removeOption = async (optId: number) => {
        const prev = options;
        setDeletingId(optId);
        setOptions((o) => o.filter((x) => x.service_option_id !== optId));
        try {
            const res = await fetch(`/api/service-options/${optId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("ลบไม่สำเร็จ");
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
            setOptions(prev);
        } finally {
            setDeletingId(null);
            setAskDelOptionId(null);
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
        } catch (e) {
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
                    <div className="flex items-center">
                        <div className="w-[205px]">ชื่อบริการ <span className="text-[var(--red)]">*</span></div>
                        <div className="w-[433px]">
                            <InputField
                                //label="ชื่อบริการ*"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="เช่น ล้างแอร์"
                                validate={(v) => (v.trim() ? null : "กรุณากรอกชื่อบริการ")}
                                maxLength={30}
                                className="h-[44px] pl-4 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="w-[205px]">หมวดหมู่ <span className="text-[var(--red)]">*</span></div>
                        <div className="w-[433px]">
                            <InputDropdown
                                //label="หมวดหมู่*"
                                value={String(categoryId)}
                                onChange={(v) => setCategoryId(Number(v))}
                                options={catOptions}
                                placeholder="เลือกหมวดหมู่"
                                className="h-[44px]"
                            //disabled
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <span className="w-[205px]">รูปภาพ <span className="text-[var(--red)]">*</span></span>

                        {imageUrl && !imageFile ? (
                            <div className="grid gap-2">
                                <div className="relative h-40 overflow-hidden rounded-xl border border-[var(--gray-300)]">
                                    <Image src={imageUrl} alt="service image" width={300} height={200} className="object-cover" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={requestRemoveImage}
                                        className="rounded-md px-3 py-2 text-sm border hover:bg-[var(--gray-100)] cursor-pointer">
                                        ลบรูปภาพ
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-1 h-[215px]">
                                <ImageUpload
                                    // label="รูปบริการ"
                                    value={imageFile}
                                    onChange={setImageFile}

                                />
                                {markRemoveImg && (
                                    <div className="text-xs text-[var(--red)]">จะลบรูปเดิมเมื่อกดบันทึก</div>
                                )}
                            </div>
                        )}
                    </div>

                    <hr className="my-2 border-[var(--gray-200)]" />

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
                                        <button
                                            type="button"
                                            onClick={() => setAskDelOptionId(o.service_option_id)}
                                            disabled={deletingId === o.service_option_id}
                                            className="w-[112px] rounded-md p-2 text-base font-semibold underline text-[var(--blue-600)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] disabled:opacity-60 cursor-pointer"
                                        >
                                            {deletingId === o.service_option_id ? "กำลังลบ..." : "ลบรายการ"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ลบรูป */}
                    <ConfirmDialog
                        open={askRemoveImg}
                        title="ลบรูปภาพ?"
                        description="คุณต้องการลบรูปเดิมออกหรือไม่"
                        onCancel={() => setAskRemoveImg(false)}
                        onConfirm={confirmRemoveImage}
                    />

                    {/* ยืนยันลบ option */}
                    <ConfirmDialog
                        open={askDelOptionId != null}
                        title="ยืนยันลบรายการย่อย?"
                        description="คุณต้องการลบรายการย่อยนี้หรือไม่"
                        loading={askDelOptionId != null && deletingId === askDelOptionId}
                        onCancel={() => setAskDelOptionId(null)}
                        onConfirm={() => {
                            if (askDelOptionId != null) removeOption(askDelOptionId);
                        }}
                    />

                    {/* เพิ่มหน่วย (dialog) */}
                    <InputDialog
                        open={addUnitOpen}
                        title="เพิ่มหน่วยใหม่"
                        description="ตั้งชื่อหน่วยที่ต้องการใช้ เช่น เครื่อง / จุด / ชิ้น"
                        placeholder="เช่น เครื่อง"
                        confirmLabel="เพิ่มหน่วย"
                        cancelLabel="ยกเลิก"
                        loading={addingUnit}
                        maxlength={8}
                        validate={(v) => {
                            if (!v.trim()) return "กรุณากรอกชื่อหน่วย";
                            if (v.length > 8) return "ชื่อหน่วยยาวเกินไป";
                            // กันซ้ำกับที่มีอยู่แล้ว
                            if (units.some((u) => u.value.toLowerCase() === v.toLowerCase())) return "มีหน่วยนี้อยู่แล้ว";
                            return null;
                        }}
                        onCancel={() => setAddUnitOpen(false)}
                        onConfirm={async (newUnit) => {
                            setAddingUnit(true);
                            try {
                                setUnits((u) => [...u, { label: newUnit, value: newUnit }]);
                                if (addUnitForRowId) {
                                    patchRow(addUnitForRowId, { unitName: newUnit });
                                }
                                setAddUnitOpen(false);
                            } catch (e) {
                                alert(e instanceof Error ? e.message : String(e));
                            } finally {
                                setAddingUnit(false);
                                setAddUnitForRowId(null);
                            }
                        }}
                    />

                    {/* subItems (draft ในฟอร์ม) — โหมด create เท่านั้น */}
                    {mode === "create" && (
                        <>
                            <hr className="my-2 border-[var(--gray-200)]" />
                            <div className="grid gap-3">
                                <div className="text-base font-medium text-[var(--gray-700)]">รายการบริการย่อย</div>

                                <div className="grid gap-2">
                                    {subItems.map((it) => (
                                        <div key={it.id}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, it.id)}
                                            onDragOver={onDragOver}
                                            onDrop={(e) => onDrop(e, it.id)}
                                            className="flex items-center gap-3 rounded-xl bg-white py-3 cursor-pointer">
                                            <div className="w-[20px] text-[var(--gray-400)]">
                                                <GripVertical className="h-[20px] w-[20px] mt-2" />
                                            </div>

                                            <div className="w-[425px]">
                                                <div className="px-1 py-1 text-sm text-[var(--gray-700)]">ชื่อรายการ</div>
                                                <InputField
                                                    value={it.name ?? ""}
                                                    onChange={(e) => patchRow(it.id, { name: e.target.value })}
                                                    validate={(v) => v.trim() ? null : "กรอกชื่อรายการ"}
                                                    validateOn="blur"
                                                    maxLength={30}
                                                    className="h-[38px]"
                                                />
                                            </div>

                                            <div className="w-[240px]">
                                                <div className="px-1 py-1 text-sm text-[var(--gray-700)]">ค่าบริการ / 1 หน่วย</div>
                                                <InputField
                                                    placeholder="ค่าบริการ / 1 หน่วย"
                                                    value={it.price == null ? "" : String(it.price)}
                                                    onChange={(e) => patchRow(it.id, { price: Number(e.target.value || 0) })}
                                                    inputMode="decimal"
                                                    rightIcon={<span className="text-[var(--gray-500)]">฿</span>}
                                                    validate={(v) => (v.trim() === "" || Number.isNaN(Number(v)) ? "ตัวเลขเท่านั้น" : null)}
                                                    validateOn="blur"
                                                    maxLength={6}
                                                    className="h-[38px]"
                                                />
                                            </div>

                                            <div className="w-[240px]">
                                                <div className="px-1 py-1 text-sm text-[var(--gray-700)]">หน่วยการบริการ</div>
                                                <div className="flex items-center gap-2">
                                                    <InputDropdown
                                                        placeholder="เลือกหน่วย"
                                                        value={it.unitName ?? ""}
                                                        onChange={(v) => patchRow(it.id, { unitName: String(v) })}
                                                        options={units}
                                                        className="w-[220px] h-[38px]"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="rounded-md w-[20px] text-xs text-[var(--gray-600)] hover:text-[var(--blue-600)] bg-[var(--gray-100)] hover:bg-[var(--gray-300)] cursor-pointer"
                                                        onClick={() => {
                                                            setAddUnitForRowId(it.id);
                                                            setAddUnitOpen(true);
                                                        }}
                                                        aria-label="add-unit"
                                                        title="เพิ่มหน่วยใหม่"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-center items-center w-[72px] mt-6">
                                                <button type="button"
                                                    onClick={() => removeRow(it.id)}
                                                    className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] cursor-pointer"
                                                    title="ลบรายการ">
                                                    <Trash2 className="h-5 w-5" />
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
