import { useState } from "react";

export type ServiceRow = {
    service_id?: number;
    servicename: string;
    category_id: number;
    price: number | null;
    description?: string | null;
    image_url?: string | null;
    image_public_id?: string | null;
};

type SaveServiceResponse =
    | { ok: true; service: ServiceRow }
    | { ok: false; message?: string };

type Props = {
    mode: "create" | "edit";
    initial?: ServiceRow;   // edit ส่งข้อมูลเดิมมา
    adminId: number;        // admin ที่แก้ไข/สร้าง
    onSaved?: (row: ServiceRow) => void;
};

export default function ServiceForm({ mode, initial, adminId, onSaved }: Props) {
    const [servicename, setServicename] = useState(initial?.servicename ?? "");
    const [categoryId, setCategoryId] = useState<number>(initial?.category_id ?? 1);
    const [price, setPrice] = useState<string>(initial?.price != null ? String(initial.price) : "");
    const [description, setDescription] = useState<string>(initial?.description ?? "");
    const [file, setFile] = useState<File | null>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const fd = new FormData();
            fd.append("servicename", servicename);
            fd.append("category_id", String(categoryId));
            if (price !== "") fd.append("price", price);
            if (description) fd.append("description", description);
            fd.append("admin_id", String(adminId));
            if (file) fd.append("file", file);

            const url = mode === "create" ? "/api/services" : `/api/services/${initial?.service_id}`;
            const method = mode === "create" ? "POST" : "PATCH";

            const res = await fetch(url, { method, body: fd });
            const data = (await res.json()) as SaveServiceResponse;
            if (!res.ok || !data?.ok) {
                throw new Error(("message" in data && data.message) || "Save failed.");
            }
            onSaved?.(data.service);
            alert(mode === "create" ? "สร้างบริการสำเร็จ" : "บันทึกการแก้ไขสำเร็จ");

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
            <label className="grid gap-1">
                <span className="text-sm font-medium">ชื่อบริการ *</span>
                <input
                    className="h-10 rounded border px-3"
                    value={servicename}
                    onChange={(e) => setServicename(e.target.value)}
                    required
                />
            </label>

            <label className="grid gap-1">
                <span className="text-sm font-medium">หมวดหมู่ (category_id) *</span>
                <input
                    type="number"
                    className="h-10 rounded border px-3"
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    required
                />
            </label>

            <label className="grid gap-1">
                <span className="text-sm font-medium">ราคา (ใส่ได้หรือเว้นว่าง)</span>
                <input
                    inputMode="decimal"
                    className="h-10 rounded border px-3"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="เช่น 800"
                />
            </label>

            <label className="grid gap-1">
                <span className="text-sm font-medium">รายละเอียด</span>
                <textarea
                    className="min-h-[90px] rounded border px-3 py-2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>

            <div className="grid gap-2">
                <span className="text-sm font-medium">รูปภาพ (อัปตอนกดบันทึก)</span>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {initial?.image_url && (
                    <a href={initial.image_url} target="_blank" className="text-sm underline" rel="noreferrer">
                        ดูรูปเดิม
                    </a>
                )}
            </div>

            {error && <div className="text-[var(--red)] text-sm">{error}</div>}

            <button
                type="submit"
                disabled={saving}
                className="h-10 rounded bg-[var(--blue-600)] text-white px-4 disabled:opacity-60"
            >
                {saving ? "กำลังบันทึก..." : mode === "create" ? "สร้างบริการ" : "บันทึกการแก้ไข"}
            </button>
        </form>
    );
}