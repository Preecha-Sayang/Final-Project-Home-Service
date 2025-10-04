import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { formatThaiDateTimeAMPM } from "lib/formatDate";
import InputField from "@/components/input/inputField/input_state";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import { Plus, Trash2 } from "lucide-react";

import type {
    PromotionId,
    PromotionRow,
    PromotionType,
    PromotionCreatePayload,
} from "@/types/promotion";
import { createPromotion, getPromotion, updatePromotion, deletePromotion } from "lib/client/promotionsApi";

type Mode = "create" | "edit";
type Props = { mode: Mode; id?: PromotionId };

function to2(n: number) { return n.toString().padStart(2, "0"); }
function mergeDateTime(dateStr: string, timeStr: string): string | null {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    let hh = 0, mm = 0;
    if (timeStr) {
        const [H, M] = timeStr.split(":").map(Number);
        hh = Number.isNaN(H) ? 0 : H;
        mm = Number.isNaN(M) ? 0 : M;
    }
    const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh, mm));
    return dt.toISOString();
}
function splitISO(iso: string | null): { date: string; time: string } {
    if (!iso) return { date: "", time: "" };
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = to2(d.getUTCMonth() + 1);
    const dd = to2(d.getUTCDate());
    const hh = to2(d.getUTCHours());
    const mm = to2(d.getUTCMinutes());
    return { date: `${y}-${m}-${dd}`, time: `${hh}:${mm}` };
}

export default function PromotionEditor({ mode, id }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [code, setCode] = useState("");
    const [dtype, setDtype] = useState<PromotionType>("fixed");
    const [amount, setAmount] = useState<string>("0");
    const [percent, setPercent] = useState<string>("0");
    const [usageLimit, setUsageLimit] = useState<string>("");
    const [expireDate, setExpireDate] = useState<string>("");
    const [expireTime, setExpireTime] = useState<string>("");

    const [createdAt, setCreatedAt] = useState<string>("");
    const [updatedAt, setUpdatedAt] = useState<string>("");

    const [askDelete, setAskDelete] = useState(false);

    useEffect(() => {
        if (mode !== "edit" || !id) return;
        (async () => {
            setLoading(true);
            try {
                const p: PromotionRow = await getPromotion(id);
                setCode(p.code);
                setDtype(p.discount_type);
                if (p.discount_type === "fixed") setAmount(String(p.discount_value));
                else setPercent(String(p.discount_value));
                setUsageLimit(p.usage_limit == null ? "" : String(p.usage_limit));
                const { date, time } = splitISO(p.expire_at);
                setExpireDate(date); setExpireTime(time);
                setCreatedAt(p.create_at); setUpdatedAt(p.update_at);
            } finally {
                setLoading(false);
            }
        })();
    }, [mode, id]);

    function sanitizeMoney(s: string): string {
        const only = s.replace(/[^\d.]/g, "");
        const parts = only.split(".");
        if (parts.length <= 1) return only;
        return `${parts[0]}.${parts.slice(1).join("").replace(/\./g, "")}`;
    }
    function sanitizeInt(s: string): string {
        return s.replace(/[^\d]/g, "");
    }

    async function submit() {
        if (!code.trim()) { alert("กรุณากรอก Promotion Code"); return; }

        const val = dtype === "fixed" ? Number(amount || 0) : Number(percent || 0);
        if (Number.isNaN(val)) { alert("กรอกจำนวนส่วนลดไม่ถูกต้อง"); return; }
        if (dtype === "percent" && (val < 0 || val > 100)) { alert("เปอร์เซนต์ต้องอยู่ระหว่าง 0–100"); return; }
        if (dtype === "fixed" && val < 0) { alert("จำนวนเงินต้องมากกว่าหรือเท่ากับ 0"); return; }

        const expire_at = mergeDateTime(expireDate, expireTime);
        const payload: PromotionCreatePayload = {
            code: code.trim(),
            discount_type: dtype,
            discount_value: val,
            usage_limit: usageLimit === "" ? null : Number(usageLimit),
            expire_at,
        };

        setSaving(true);
        try {
            if (mode === "create") {
                const p = await createPromotion(payload);
                await router.push(`/admin/promotions/${p.promotion_id}`);
            } else if (id) {
                const p = await updatePromotion(id, payload);
                await router.push(`/admin/promotions/${p.promotion_id}`);
            }
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setSaving(false);
        }
    }

    async function confirmDelete() {
        if (!id) return;
        setSaving(true);
        try {
            await deletePromotion(id);
            await router.push("/admin/promotions");
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setSaving(false);
            setAskDelete(false);
        }
    }

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); void submit(); }}
            className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]"
        >
            {loading ? (
                <div className="py-16 text-center text-[var(--gray-500)]">Loading…</div>
            ) : (
                <div className="grid gap-6">
                    <div className="flex items-center">
                        <div className="w-[205px]">Promotion Code <span className="text-[var(--red)]">*</span></div>
                        <div className="w-[433px]">
                            <InputField
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={64}
                                className="h-[44px]"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-8">
                        <div className="w-[205px] pt-2">ประเภท <span className="text-[var(--red)]">*</span></div>
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    checked={dtype === "fixed"}
                                    onChange={() => setDtype("fixed")}
                                />
                                <span>Fixed</span>
                                <InputField
                                    value={amount}
                                    onChange={(e) => setAmount(sanitizeMoney(e.target.value))}
                                    disabled={dtype !== "fixed"}
                                    rightIcon={<span>฿</span>}
                                    className="h-[36px] w-[140px]"
                                />
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    checked={dtype === "percent"}
                                    onChange={() => setDtype("percent")}
                                />
                                <span>Percent</span>
                                <InputField
                                    value={percent}
                                    onChange={(e) => setPercent(sanitizeMoney(e.target.value))}
                                    disabled={dtype !== "percent"}
                                    rightIcon={<span>%</span>}
                                    className="h-[36px] w-[140px]"
                                />
                            </label>
                        </div>
                    </div>

                    {/* limit */}
                    <div className="flex items-center">
                        <div className="w-[205px]">โควต้าการใช้</div>
                        <div className="flex items-center gap-2">
                            <InputField
                                value={usageLimit}
                                onChange={(e) => setUsageLimit(sanitizeInt(e.target.value))}
                                placeholder="เช่น 100 (เว้นว่าง = ไม่จำกัด)"
                                className="h-[44px] w-[240px]"
                            />
                            <span>ครั้ง</span>
                        </div>
                    </div>

                    {/* expire */}
                    <div className="flex items-center">
                        <div className="w-[205px]">วันหมดอายุ</div>
                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                className="rounded-md border px-3 py-2"
                                value={expireDate}
                                onChange={(e) => setExpireDate(e.target.value)}
                            />
                            <input
                                type="time"
                                className="rounded-md border px-3 py-2"
                                value={expireTime}
                                onChange={(e) => setExpireTime(e.target.value)}
                            />
                            <button
                                type="button"
                                className="text-sm underline text-[var(--blue-600)]"
                                onClick={() => { setExpireDate(""); setExpireTime(""); }}
                            >
                                ล้างค่า
                            </button>
                        </div>
                    </div>

                    {mode === "edit" && (
                        <>
                            <hr className="border-[var(--gray-200)]" />
                            <div className="pl-2 text-base text-[var(--gray-700)]">
                                <div className="flex justify-between items-center w-[387px] h-[44px] gap-4">
                                    <div className="text-[var(--gray-500)]">สร้างเมื่อ</div>
                                    <div>{formatThaiDateTimeAMPM(createdAt)}</div>
                                </div>
                                <div className="flex justify-between items-center w-[387px] h-[44px] gap-4">
                                    <div className="text-[var(--gray-500)]">แก้ไขล่าสุด</div>
                                    <div>{formatThaiDateTimeAMPM(updatedAt)}</div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3">
                        {mode === "edit" && (
                            <button
                                type="button"
                                className="rounded-lg border px-4 py-2 text-[var(--red)] hover:bg-rose-50"
                                onClick={() => setAskDelete(true)}
                            >
                                ลบ Promotion
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[var(--blue-600)] px-4 py-2 text-white disabled:opacity-60"
                        >
                            {saving ? "กำลังบันทึก…" : mode === "create" ? "สร้าง" : "ยืนยัน"}
                        </button>
                    </div>

                    <ConfirmDialog
                        open={askDelete}
                        title="ลบ Promotion นี้?"
                        description="การลบไม่สามารถย้อนกลับได้"
                        onCancel={() => setAskDelete(false)}
                        onConfirm={confirmDelete}
                    />
                </div>
            )}
        </form>
    );
}
