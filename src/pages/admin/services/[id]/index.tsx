import { useEffect, useMemo, useState } from "react";
import { api } from "lib/client/api";
import { uploadToCloudinary } from "lib/client/upload";
import { SubItem, ServicePayload, UNITS } from "@/types/service";
import { useRouter } from "next/navigation";
import InputField from "@/components/input/inputField/input_state";
import InputDropdown, { Option } from "@/components/input/inputDropdown/input_dropdown";
import ImageUpload from "@/components/input/inputImageUpload/image_upload";

const priceValidate = (v: string) => {
    if (v === "") return null;
    const n = Number(v);
    if (Number.isNaN(n) || n < 0) return "ราคาต้องเป็นตัวเลขไม่ติดลบ";
    return null;
};

export default function AddServicePage() {
    const router = useRouter();

    // ฟิลด์หลัก
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    // รายการย่อย
    const [items, setItems] = useState<SubItem[]>([
        { name: "", price: "", unit: "" },
    ]);

    // categories จาก API
    const [categories, setCategories] = useState<Option[]>([]);
    const [loadingCats, setLoadingCats] = useState(false);

    // สถานะ submit
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // โหลดหมวดหมู่
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingCats(true);
                const { data } = await api.get("/categories");
                const opts: Option[] = (data?.categories ?? []).map((c: any) => ({
                    label: c.name,
                    value: String(c.id),
                }));
                if (mounted) setCategories(opts);
            } catch (e) {
                // mockup
                if (mounted)
                    setCategories([
                        { label: "ล้างแอร์", value: "1" },
                        { label: "กำจัดฝุ่น", value: "2" },
                    ]);
            } finally {
                setLoadingCats(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // จัดการรายการย่อย
    const handleItemChange = (idx: number, key: keyof SubItem, val: string) => {
        setItems((prev) => {
            const cp = [...prev];
            cp[idx] = { ...cp[idx], [key]: val };
            return cp;
        });
    };

    const addItem = () => setItems((p) => [...p, { name: "", price: "", unit: "" }]);
    const removeItem = (idx: number) =>
        setItems((p) => p.filter((_, i) => i !== idx));

    const formValid = useMemo(() => {
        if (!name.trim()) return false;
        if (!categoryId) return false;
        if (!imageFile) return false;

        const filled = items.filter(
            (it) => it.name.trim() || it.price.trim() || it.unit.trim()
        );
        if (filled.length === 0) return false;
        return filled.every(
            (it) => it.name.trim() && !priceValidate(it.price) && it.unit.trim()
        );
    }, [name, categoryId, imageFile, items]);

    const handleCancel = () => router.back();

    const handleSubmit = async () => {
        setFormError(null);
        if (!formValid) {
            setFormError("กรุณากรอกข้อมูลให้ครบตามช่องที่มี *");
            return;
        }

        try {
            setSubmitting(true);

            // Cloudinary
            const imageUrl = await uploadToCloudinary(imageFile!);

            // payload
            const payload: ServicePayload = {
                name: name.trim(),
                categoryId,
                imageUrl,
                items: items
                    .filter((it) => it.name || it.price || it.unit)
                    .map((it) => ({
                        name: it.name.trim(),
                        price: Number(it.price),
                        unit: it.unit.trim(),
                    })),
            };

            // บันทึกลง Neon
            await api.post("/services", payload);

            // แจ้งบันทึกเสร็จ
            alert("สร้างบริการสำเร็จ");
            router.push("/services"); // เปลี่ยน path ตามโปรเจ็กต์จริง
        } catch (e: any) {
            console.error(e);
            setFormError(e?.message ?? "บันทึกไม่สำเร็จ");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl p-6">
            {/* แถบบน */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-[var(--gray-900)]">
                    เพิ่มบริการ
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="rounded-md border border-[var(--gray-300)] bg-white px-4 py-2 text-sm hover:bg-[var(--gray-100)]"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formValid || submitting}
                        className="rounded-md bg-[var(--blue-600)] px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {submitting ? "กำลังสร้าง..." : "สร้าง"}
                    </button>
                </div>
            </div>

            {/* การ์ดฟอร์ม */}
            <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                {/* แถว: ชื่อบริการ */}
                <div className="mb-4 max-w-xl">
                    <InputField
                        label="ชื่อบริการ*"
                        placeholder="เช่น ล้างแอร์"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        validate={(v) => (!v.trim() ? "กรุณากรอกชื่อบริการ" : null)}
                    />
                </div>

                {/* แถว: หมวดหมู่ */}
                <div className="mb-6 max-w-xl">
                    <InputDropdown
                        label="หมวดหมู่ *"
                        value={categoryId}
                        onChange={setCategoryId}
                        options={categories}
                        placeholder={loadingCats ? "กำลังโหลด..." : "เลือกหมวดหมู่"}
                    />
                </div>

                {/* แถว: รูปภาพ */}
                <div className="mb-8 max-w-md">
                    <ImageUpload
                        label="รูปภาพ *"
                        value={imageFile}
                        onChange={setImageFile}
                        accept="image/*"
                    />
                    <p className="mt-2 text-xs text-[var(--gray-400)]">
                        ขนาดแนะนำ: 1440 × 225 px
                    </p>
                </div>

                {/* เส้นคั่น */}
                <div className="my-6 h-px w-full bg-[var(--gray-200)]" />

                {/* รายการบริการย่อย */}
                <h2 className="mb-3 text-sm font-medium text-[var(--gray-800)]">
                    รายการบริการย่อย
                </h2>

                <div className="space-y-4">
                    {items.map((it, idx) => (
                        <div key={idx} className="grid grid-cols-12 items-start gap-3">
                            {/* ชื่อรายการ */}
                            <div className="col-span-12 md:col-span-4">
                                <InputField
                                    label={idx === 0 ? "ชื่อรายการ" : undefined}
                                    placeholder="เช่น ล้างแอร์แบบแขวน"
                                    value={it.name}
                                    onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                                    validateOn="blur"
                                    validate={(v) => (v.trim() ? null : "กรุณากรอกชื่อรายการ")}
                                />
                            </div>

                            {/* ราคา / 1 หน่วย (มีไอคอน ฿) */}
                            <div className="col-span-12 md:col-span-3">
                                <InputField
                                    label={idx === 0 ? "ค่าบริการ / 1 หน่วย" : undefined}
                                    inputMode="decimal"
                                    placeholder="เช่น 800"
                                    value={it.price}
                                    onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                                    validate={priceValidate}
                                    validateOn="blur"
                                    rightIcon={<span className="text-[var(--gray-400)]">฿</span>}
                                />
                            </div>

                            {/* หน่วยการบริการ */}
                            <div className="col-span-12 md:col-span-3">
                                <InputDropdown
                                    label={idx === 0 ? "หน่วยการบริการ" : undefined}
                                    value={it.unit}
                                    onChange={(v) => handleItemChange(idx, "unit", v)}
                                    options={UNITS.map((u) => ({ label: u, value: u }))}
                                    placeholder="เลือกหน่วย"
                                />
                            </div>

                            {/* ลบรายการ */}
                            <div className="col-span-12 md:col-span-2 flex h-full items-end">
                                <button
                                    onClick={() => removeItem(idx)}
                                    className="text-left text-sm text-[var(--gray-500)] underline hover:text-[var(--gray-700)]"
                                >
                                    ลบรายการ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* เพิ่มรายการ */}
                <div className="mt-6">
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 rounded-md border border-[var(--gray-300)] bg-white px-3 py-2 text-sm hover:bg-[var(--gray-100)]"
                    >
                        <span>เพิ่มรายการ</span>
                        <span className="font-semibold">＋</span>
                    </button>
                </div>

                {/* ฟอร์มเออเรอร์รวม */}
                {formError && (
                    <p className="mt-4 text-sm text-[var(--red-600)]">{formError}</p>
                )}
            </div>
        </div>
    );
}