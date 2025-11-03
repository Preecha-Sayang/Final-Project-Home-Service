// src/components/admin/services/editor.tsx
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { GripVertical, Plus } from "lucide-react";
import Image from "next/image";
import ImageLightbox from "@/components/common/Lightbox";

import InputField from "@/components/input/inputField/input_state";
import InputDropdown, { Option } from "@/components/input/inputDropdown/input_dropdown";
import ImageUpload from "@/components/input/inputImageUpload/image_upload";

import type { SubItem, ServiceItem, CategoryRow } from "@/types/service";
import { getService, listCategories } from "lib/client/servicesApi";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import InputDialog from "@/components/dialog/input_dialog";
import { formatThaiDateTimeAMPM } from "lib/formatDate";

type Mode = "create" | "edit";
type Props = { mode: Mode; id?: string };
type UnitOpt = { label: string; value: string };

function emptySub(i: number): SubItem {
    return { id: `tmp-${Date.now()}-${i}`, name: "", unitName: "", price: 0, index: i + 1 };
}

/** (service_option) */
type OptionRow = {
    service_option_id?: number;
    name: string;
    unit: string;
    unit_price: string;
    _tmpId?: string;
};

type UnitsResponseOk = { ok: true; units: string[] };
type UnitsResponseErr = { ok: false; message?: string };
type UnitsResponse = UnitsResponseOk | UnitsResponseErr;

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
    const [showImg, setShowImg] = useState(false);

    // สำหรับหน้า create เท่านั้น
    const [subItems, setSubItems] = useState<SubItem[]>([emptySub(0), emptySub(1)]);

    // รายละเอียด (ถ้าต้องใช้)
    const [basePrice, setBasePrice] = useState<number | null>(null);
    const [description, setDescription] = useState<string>("");

    // options (เฉพาะหน้า edit)
    const [options, setOptions] = useState<OptionRow[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    // หน่วย
    const [units, setUnits] = useState<UnitOpt[]>([]);
    const [addUnitOpen, setAddUnitOpen] = useState(false);
    const [addUnitForRowId, setAddUnitForRowId] = useState<string | null>(null);
    const [addingUnit, setAddingUnit] = useState(false);

    // ลบรูป
    const [askRemoveImg, setAskRemoveImg] = useState(false);
    const [markRemoveImg, setMarkRemoveImg] = useState(false);

    // ลบรายการย่อย
    const [askDelOptionId, setAskDelOptionId] = useState<number | string | null>(null);
    const [deletingId, setDeletingId] = useState<number | string | null>(null);

    // ลบบริการ
    const [askDeleteService, setAskDeleteService] = useState(false);

    // เวลาแสดงผล
    const [createdAt, setCreatedAt] = useState<string>("");
    const [updatedAt, setUpdatedAt] = useState<string>("");

    // โหลดหมวดหมู่
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
                if (d?.ok) setUnits(d.units.map((u) => ({ label: u, value: u })));
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
                setCategoryId(Number(s.categoryId ?? 0));
                setImageUrl(s.imageUrl ?? "");
                setCreatedAt(s.createdAt);
                setUpdatedAt(s.updatedAt);

                // (ถ้าต้องใช้)
                setBasePrice((s as Partial<ServiceItem> & { price?: number }).price ?? null);
                setDescription((s as Partial<ServiceItem> & { description?: string }).description ?? "");

                // ดึงรายการย่อยจาก API (เฉพาะหน้า edit)
                setLoadingOptions(true);
                const r = await fetch(`/api/services/${id}/options`);
                const d: ServiceOptionsResponse = await r.json();
                if (d.ok) {
                    setOptions(
                        (d.options ?? []).map((o) => ({
                            service_option_id: o.service_option_id,
                            name: o.name,
                            unit: o.unit ?? "",
                            unit_price: o.unit_price ?? "",
                        }))
                    );
                }
            } finally {
                setLoading(false);
                setLoadingOptions(false);
            }
        })();
    }, [mode, id]);

    // ---ลบ option ----------
    const removeOption = async (localKey: number | string) => {
        const target = options.find((o) => String(o.service_option_id ?? o._tmpId) === String(localKey));
        if (!target) return;

        const prev = options;
        setDeletingId(localKey);
        setOptions((o) => o.filter((x) => String(x.service_option_id ?? x._tmpId) !== String(localKey)));

        try {
            if (target.service_option_id) {
                const res = await fetch(`/api/service-options/${target.service_option_id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("ลบไม่สำเร็จ");
            }
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
            setOptions(prev);
        } finally {
            setDeletingId(null);
            setAskDelOptionId(null);
        }
    };

    // ลบรูป
    function requestRemoveImage() {
        setAskRemoveImg(true);
    }
    function confirmRemoveImage() {
        setAskRemoveImg(false);
        setImageUrl("");
        setImageFile(null);
        setMarkRemoveImg(true);
    }

    // ---DnD ของ options (เฉพาะหน้า edit)
    const optDragSrc = useRef<string | null>(null);

    function onOptDragStart(e: React.DragEvent<HTMLDivElement>, key: string) {
        optDragSrc.current = key;
        e.dataTransfer.effectAllowed = "move";
    }

    function onOptDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function onOptDrop(e: React.DragEvent<HTMLDivElement>, targetKey: string) {
        e.preventDefault();
        const srcKey = optDragSrc.current;
        optDragSrc.current = null;
        if (!srcKey || srcKey === targetKey) return;

        const arr = [...options];
        const idxFrom = arr.findIndex((x) => String(x.service_option_id ?? x._tmpId) === String(srcKey));
        const idxTo = arr.findIndex((x) => String(x.service_option_id ?? x._tmpId) === String(targetKey));
        if (idxFrom === -1 || idxTo === -1) return;

        const [moved] = arr.splice(idxFrom, 1);
        arr.splice(idxTo, 0, moved);
        setOptions(arr);
    }

    // ---DnD ของ subItems (เฉพาะหน้า create)
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
        // กันลบจนเหลือ 0: ถ้าเหลือ 1 แถว ไม่ทำงาน
        setSubItems((s) => {
            if (s.length <= 1) return s;
            const next = s.filter((x) => x.id !== rowId).map((x, i) => ({ ...x, index: i + 1 }));
            // ถ้าลบแล้วเหลือ 0 (กรณีลบแถวเดียว) ให้คงไว้เท่าเดิม
            return next.length === 0 ? s : next;
        });
    const patchRow = (rowId: string, p: Partial<SubItem>) =>
        setSubItems((s) => s.map((x) => (x.id === rowId ? { ...x, ...p } : x)));

    // ---เพิ่ม / แก้ไข----------
    function addOptionInline() {
        setOptions((o) => [...o, { _tmpId: `tmp-${Date.now()}`, name: "", unit: "", unit_price: "" }]);
    }
    function patchOption(localKey: number | string, partial: Partial<OptionRow>) {
        setOptions((o) =>
            o.map((it) => (String(it.service_option_id ?? it._tmpId) === String(localKey) ? { ...it, ...partial } : it))
        );
    }

    /** ---กรอกเฉพาะตัวเลข+ทศนิยม */
    function sanitizeMoneyInput(v: string): string {
        const only = v.replace(/[^\d.]/g, "");
        const parts = only.split(".");
        if (parts.length <= 1) return only;
        return `${parts[0]}.${parts.slice(1).join("").replace(/\./g, "")}`;
    }

    // ---ส่งฟอร์ม (create / edit) รวมอัปเดต options
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
        // fd.append("admin_id", "1");
        if (basePrice != null) fd.append("price", String(basePrice));
        if (description) fd.append("description", description);
        if (mode === "create") {
            // แนบ subItems (หน้า create เท่านั้น)
            fd.append("subItems", JSON.stringify(subItems));
        }
        if (!imageFile && imageUrl) fd.append("image_url", imageUrl);
        if (imageFile) fd.append("file", imageFile);
        if (markRemoveImg) fd.append("remove_image", "1");

        setSaving(true);
        try {
            if (mode === "create") {
                const res = await fetch("/api/services", { method: "POST", body: fd });
                const data: { ok: boolean; message?: string; service?: { service_id: number } } = await res.json();
                if (!res.ok || !data?.ok || !data.service) throw new Error(data?.message || "Create failed");
                await router.push(`/admin/services/${data.service.service_id}`);
                return;
            } else {
                // edit.
                if (!id) return;

                // 1. อัปเดตข้อมูลบริการ
                const res = await fetch(`/api/services/${id}`, { method: "PATCH", body: fd });
                const data: { ok: boolean; message?: string; service?: { service_id: number } } = await res.json();
                if (!res.ok || !data?.ok || !data.service) throw new Error(data?.message || "Update failed");

                // 2. อัปเดต options แบบชุด
                const optBody = {
                    options: options
                        .map((o, i) => ({
                            service_option_id: o.service_option_id,
                            name: (o.name ?? "").trim(),
                            unit: (o.unit ?? "").trim(),
                            unit_price: sanitizeMoneyInput(o.unit_price ?? ""),
                            position: i + 1, // เพิ่ม position
                        }))
                        .filter((o) => !!o.name && !!o.unit && o.unit_price !== ""),
                };
                const resOpt = await fetch(`/api/services/${id}/options`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(optBody),
                });
                const dOpt: ServiceOptionsResponse = await resOpt.json();
                if (!resOpt.ok || !dOpt.ok)
                    throw new Error((dOpt as ServiceOptionsResponseErr)?.message || "Update options failed");

                await router.push(`/admin/services/${data.service.service_id}`);
                return;
            }
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setSaving(false);
        }
    }

    // ---ลบบริการ (แสดงกำลังลบ + กันยิงซ้ำ + เปลี่ยนหน้าแล้วจบ)
    async function handleDeleteService(): Promise<void> {
        if (!id) return;
        try {
            setSaving(true);
            const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
            const d = (await res.json()) as { ok: boolean; message?: string };
            if (!res.ok || !d.ok) throw new Error(d.message || "Delete failed.");
            await router.push("/admin/services");
            return;
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setSaving(false);
            setAskDeleteService(false);
        }
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void handleSubmit();
    }

    // เหลือ 1 รายการ
    const canDeleteOption = options.length > 1;
    const canDeleteSubItem = subItems.length > 1;

    return (
        <>
            <form
                id="service-form"
                onSubmit={onSubmit}
                className="bg-white p-6 py-10 rounded-lg border shadow-[0_10px_24px_rgba(0,0,0,.06)]"
            >
                {loading ? (
                    <div className="py-16 text-center text-[var(--gray-500)]">Loading…</div>
                ) : (
                    <div className="grid gap-6">
                        {/* ชื่อ/หมวดหมู่/รูป */}
                        <div className="flex items-center">
                            <div className="w-[205px]">
                                ชื่อบริการ <span className="text-[var(--red)]">*</span>
                            </div>
                            <div className="w-[433px]">
                                <InputField
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
                            <div className="w-[205px]">
                                หมวดหมู่ <span className="text-[var(--red)]">*</span>
                            </div>
                            <div className="w-[433px]">
                                <InputDropdown
                                    value={String(categoryId)}
                                    onChange={(v) => setCategoryId(Number(v))}
                                    options={catOptions}
                                    placeholder="เลือกหมวดหมู่"
                                    className="h-[44px]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <span className="w-[205px]">
                                รูปภาพ <span className="text-[var(--red)]">*</span>
                            </span>

                            {imageUrl && !imageFile ? (
                                <div className="flex flex-col">
                                    <div className="flex justify-center w-[433px] border rounded-md">
                                        <div
                                            className="relative overflow-hidden border border-[var(--gray-300)] shadow-[0_10px_24px_rgba(0,0,0,.06)] hover:shadow-[0_15px_24px_rgba(0,0,0,.1)] cursor-zoom-in transition"
                                            style={{ width: 300, height: 200 }}
                                            onClick={() => setShowImg(true)}
                                            title="คลิกเพื่อขยาย"
                                        >
                                            <Image src={imageUrl} alt="service image" fill sizes="300px" className="object-cover" />
                                            <ImageLightbox
                                                src={imageUrl}
                                                alt={name || "image"}
                                                open={showImg}
                                                onClose={() => setShowImg(false)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between pr-2 my-2 h-[18.5px] font-semibold">
                                        <span className=" text-sm font-[400] text-[var(--gray-400)]">ขนาดภาพที่แนะนำ: 1440 x 225 PX</span>
                                        <button
                                            type="button"
                                            onClick={requestRemoveImage}
                                            className="text-sm underline text-[var(--blue-600)] cursor-pointer"
                                        >
                                            ลบรูปภาพ
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="pr-2 mt-3 font-semibold">
                                        <ImageUpload value={imageFile} onChange={setImageFile} />
                                        {/* {markRemoveImg && <div className="absolute mt-2 text-xs text-[var(--red)]">จะลบรูปเดิมเมื่อกดบันทึก</div>} */}
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="my-2 border-[var(--gray-200)]" />

                        {mode === "edit" && (
                            <div className="grid gap-3">
                                <div className="text-base font-medium text-[var(--gray-800)]">รายการบริการย่อย</div>

                                {loadingOptions && <div className="text-sm text-[var(--gray-500)]">กำลังโหลดรายการย่อย…</div>}

                                <div className="grid gap-2">
                                    {options.map((o) => {
                                        const localKey = String(o.service_option_id ?? o._tmpId);
                                        return (
                                            <div
                                                key={localKey}
                                                draggable
                                                onDragStart={(e) => onOptDragStart(e, localKey)}
                                                onDragOver={onOptDragOver}
                                                onDrop={(e) => onOptDrop(e, localKey)}
                                                className="flex items-start gap-3 rounded-xl bg-white p-3"
                                            >
                                                {/* ตัวลาก */}
                                                <div
                                                    className="basis-[4.10%] flex justify-center text-[var(--gray-400)] cursor-grab active:cursor-grabbing select-none"
                                                    title="ลากเพื่อสลับลำดับ"
                                                >
                                                    <GripVertical className="mt-2" />
                                                </div>
                                                {/* ชื่อรายการ */}
                                                <div className="basis-[40.49%]">
                                                    <div className="px-1 py-1 text-sm text-[var(--gray-700)]">
                                                        ชื่อรายการ<span className="text-[var(--red)]">*</span>
                                                    </div>
                                                    <InputField
                                                        value={o.name}
                                                        onChange={(e) => patchOption(localKey, { name: e.target.value })}
                                                        validate={(v) => (v.trim() ? null : "กรอกชื่อรายการ")}
                                                        validateOn="blur"
                                                        maxLength={30}
                                                        className="h-[38px]"
                                                    />
                                                </div>

                                                {/* หน่วย */}
                                                <div className="basis-[23.51%]">
                                                    <div className="px-1 py-1 text-sm text-[var(--gray-700)]">
                                                        หน่วยการบริการ<span className="text-[var(--red)]">*</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="basis-[85%]">
                                                            <InputDropdown
                                                                placeholder="เลือกหน่วย"
                                                                value={o.unit}
                                                                onChange={(v) => patchOption(localKey, { unit: String(v) })}
                                                                options={units}
                                                                className="h-[38px]"
                                                            />
                                                        </div>
                                                        <div className="basis-[15%]">
                                                            <button
                                                                type="button"
                                                                className="rounded-md w-[40px] h-[36px] grid place-items-center text-[var(--gray-600)] hover:text-[var(--blue-600)] bg-[var(--gray-100)] hover:bg-[var(--gray-300)] cursor-pointer"
                                                                onClick={() => {
                                                                    setAddUnitForRowId(localKey);
                                                                    setAddUnitOpen(true);
                                                                }}
                                                                aria-label="add-unit"
                                                                title="เพิ่มหน่วยใหม่"
                                                            >
                                                                <Plus className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ราคา/หน่วย */}
                                                <div className="basis-[22.39%]">
                                                    <div className="px-1 py-1 text-sm text-[var(--gray-700)]">
                                                        ค่าบริการ / 1 หน่วย<span className="text-[var(--red)]">*</span>
                                                    </div>
                                                    <InputField
                                                        placeholder="0.00"
                                                        value={o.unit_price}
                                                        onChange={(e) => patchOption(localKey, { unit_price: sanitizeMoneyInput(e.target.value) })}
                                                        inputMode="decimal"
                                                        rightIcon={<span className="text-[var(--gray-500)]">฿</span>}
                                                        validate={(v) => (v.trim() === "" ? "กรอกตัวเลข" : null)}
                                                        validateOn="blur"
                                                        maxLength={10}
                                                        className="h-[38px]"
                                                    />
                                                </div>

                                                <div className="basis-[9.51%] flex items-end justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // ถ้าเหลือ 1 รายการ ไม่ให้ลบ/ไม่ต้องเปิด dialog
                                                            if (!canDeleteOption) return;
                                                            setAskDelOptionId(localKey);
                                                        }}
                                                        disabled={deletingId === localKey || !canDeleteOption}
                                                        className={`h-[44px] rounded-md px-4 mt-6 text-base font-semibold underline ${canDeleteOption
                                                            ? "text-[var(--blue-600)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] cursor-pointer"
                                                            : "text-[var(--gray-300)] cursor-not-allowed"
                                                            } disabled:opacity-60`}
                                                        title={canDeleteOption ? "ลบรายการ" : "ต้องมีอย่างน้อย 1 รายการ"}
                                                    >
                                                        {deletingId === localKey ? "กำลังลบ..." : "ลบรายการ"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={addOptionInline}
                                        className="flex justify-center items-center w-[185px] h-[44px] mt-1 gap-2 rounded-lg border border-[var(--blue-600)] px-3 py-2 text-base font-medium text-[var(--blue-600)] hover:text-[var(--gray-100)] hover:bg-[var(--blue-600)] cursor-pointer"
                                    >
                                        เพิ่มรายการ <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === "edit" && (
                            <>
                                <hr className="border-[var(--gray-200)]" />
                                <div className="pl-2 text-base text-[var(--gray-700)]">
                                    <div className="flex justify-between items-center w-[387px] h-[44px] gap-4">
                                        <div className="text-[var(--gray-500)]">สร้างเมื่อ</div>
                                        <div>{formatThaiDateTimeAMPM(createdAt)}</div>
                                    </div>
                                    <div className="flex justify-between items-center w-[387px] h-[44px] gap-4">
                                        <div className="flex items-center text-[var(--gray-500)]">แก้ไขล่าสุด</div>
                                        <div>{formatThaiDateTimeAMPM(updatedAt)}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        <ConfirmDialog
                            open={askRemoveImg}
                            title="ลบรูปภาพ?"
                            description="คุณต้องการลบรูปเดิมออกหรือไม่"
                            onCancel={() => setAskRemoveImg(false)}
                            onConfirm={confirmRemoveImage}
                        />

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
                                if (units.some((u) => u.value.toLowerCase() === v.toLowerCase())) return "มีหน่วยนี้อยู่แล้ว";
                                return null;
                            }}
                            onCancel={() => setAddUnitOpen(false)}
                            onConfirm={async (newUnit) => {
                                setAddingUnit(true);
                                try {
                                    setUnits((u) => [...u, { label: newUnit, value: newUnit }]);
                                    if (addUnitForRowId) patchOption(addUnitForRowId, { unit: newUnit });
                                    setAddUnitOpen(false);
                                } catch (e) {
                                    alert(e instanceof Error ? e.message : String(e));
                                } finally {
                                    setAddingUnit(false);
                                    setAddUnitForRowId(null);
                                }
                            }}
                        />

                        {/* subItemsใช้เฉพาะตอนสร้าง */}
                        {mode === "create" && (
                            <>
                                <div className="grid gap-3">
                                    <div className="text-base font-medium text-[var(--gray-700)]">รายการบริการย่อย</div>

                                    <div className="grid gap-2">
                                        {subItems.map((it) => (
                                            <div
                                                key={it.id}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, it.id)}
                                                onDragOver={onDragOver}
                                                onDrop={(e) => onDrop(e, it.id)}
                                                className="flex items-start gap-3 rounded-xl bg-white py-3 cursor-pointer"
                                            >
                                                <div className="basis-[4.10%] flex justify-center  text-[var(--gray-400)]">
                                                    <GripVertical className="mt-2" />
                                                </div>

                                                <div className="basis-[40.49%]">
                                                    <div className="px-1 py-1 text-sm text-[var(--gray-700)]">
                                                        ชื่อรายการ<span className="text-[var(--red)]">*</span>
                                                    </div>
                                                    <InputField
                                                        value={it.name ?? ""}
                                                        onChange={(e) => patchRow(it.id, { name: e.target.value })}
                                                        validate={(v) => (v.trim() ? null : "กรอกชื่อรายการ")}
                                                        validateOn="blur"
                                                        maxLength={30}
                                                        className="h-[38px]"
                                                    />
                                                </div>

                                                <div className="basis-[23.51%]">
                                                    <div className="px-1 py-1 text-sm text-[var(--gray-700)]">
                                                        หน่วยการบริการ<span className="text-[var(--red)]">*</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="basis-[85%]">
                                                            <InputDropdown
                                                                placeholder="เลือกหน่วย"
                                                                value={it.unitName ?? ""}
                                                                onChange={(v) => patchRow(it.id, { unitName: String(v) })}
                                                                options={units}
                                                                className="h-[38px]"
                                                            />
                                                        </div>
                                                        <div className="basis-[15%]">
                                                            <button
                                                                type="button"
                                                                className="rounded-md w-[40px] h-[36px] grid place-items-center text-xs text-[var(--gray-600)] hover:text-[var(--blue-600)] bg-[var(--gray-100)] hover:bg-[var(--gray-300)] cursor-pointer"
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
                                                </div>

                                                <div className="basis-[22.39%]">
                                                    <div className="px-1 py-1 text-sm text-[var(--gray-700)]">
                                                        ค่าบริการ / 1 หน่วย<span className="text-[var(--red)]">*</span>
                                                    </div>
                                                    <InputField
                                                        placeholder="0.00"
                                                        value={it.price == null ? "" : String(it.price)}
                                                        onChange={(e) =>
                                                            patchRow(it.id, { price: Number(sanitizeMoneyInput(e.target.value) || 0) })
                                                        }
                                                        inputMode="decimal"
                                                        rightIcon={<span className="text-[var(--gray-500)]">฿</span>}
                                                        validate={(v) => (v.trim() === "" || Number.isNaN(Number(v)) ? "ตัวเลขเท่านั้น" : null)}
                                                        validateOn="blur"
                                                        maxLength={6}
                                                        className="h-[38px]"
                                                    />
                                                </div>

                                                <div className="basis-[9.51%] flex justify-center items-center mt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!canDeleteSubItem) return; // กันลบจนเหลือ 0
                                                            removeRow(it.id);
                                                        }}
                                                        disabled={!canDeleteSubItem}
                                                        className={`h-[44px] rounded-md px-4 mt-1 underline ${canDeleteSubItem
                                                            ? "text-[var(--gray-400)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] cursor-pointer"
                                                            : "text-[var(--gray-300)] cursor-not-allowed"
                                                            }`}
                                                        title={canDeleteSubItem ? "ลบรายการ" : "ต้องมีอย่างน้อย 1 รายการ"}
                                                    >
                                                        ลบรายการ
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="flex justify-center items-center w-[185px] h-[44px] mt-1 gap-2 rounded-lg border border-[var(--blue-600)] px-3 py-2 text-base font-medium text-[var(--blue-600)] hover:text-[var(--gray-100)] hover:bg-[var(--blue-600)] cursor-pointer"
                                    >
                                        เพิ่มรายการ <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* แถบ Confirm ลบบริการ */}
                        <ConfirmDialog
                            open={askDeleteService}
                            title="ลบบริการนี้?"
                            description="การลบจะลบทั้งบริการและรายการย่อยทั้งหมด"
                            loading={saving}
                            onCancel={() => setAskDeleteService(false)}
                            onConfirm={handleDeleteService}
                        />

                        {/* Overlay saving */}
                        {saving && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                                <div className="rounded-2xl bg-white px-6 py-5 shadow-lg border border-[var(--gray-100)]">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--blue-600)] border-r-transparent"></span>
                                        <div className="text-sm text-[var(--gray-800)]">
                                            {askDeleteService ? "กำลังลบบริการ…" : "กำลังบันทึกข้อมูล…"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>
            {/* ปุ่มลบบริการ — มุมขวาล่าง */}
            {mode === "edit" && (
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        disabled={saving}
                        className="flex px-6 py-4 gap-2 text-base text-[var(--gray-600)] font-semibold underline hover:text-[var(--blue-600)] disabled:opacity-60 cursor-pointer"
                        onClick={() => setAskDeleteService(true)}
                        title="ลบบริการ"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM10 11V17V11ZM14 11V17V11ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z"
                                stroke="#9AA1B0"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        ลบบริการ
                    </button>
                </div>
            )}
        </>
    );
}
