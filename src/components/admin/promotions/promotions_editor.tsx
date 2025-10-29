import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { formatThaiDateTimeAMPM } from "lib/formatDate";
import InputField from "@/components/input/inputField/input_state";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import DatePicker from "@/components/input/inputDatePicker/date_picker";
import TimePicker from "@/components/input/inputTimePicker/time_picker";

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
    const [dd, mm, yyyy] = dateStr.split("-").map(Number);
    if (!dd || !mm || !yyyy) return null;
    const [H, M] = (timeStr || "00:00").split(":").map(Number);
    const dt = new Date(yyyy, (mm ?? 1) - 1, dd ?? 1, H || 0, M || 0, 0, 0);
    return dt.toISOString();
}
function splitISO(iso: string | null): { date: string; time: string } {
    if (!iso) return { date: "", time: "" };
    const d = new Date(iso);
    const date = `${to2(d.getDate())}-${to2(d.getMonth() + 1)}-${d.getFullYear()}`;
    const time = `${to2(d.getHours())}:${to2(d.getMinutes())}`;
    return { date, time };
}
function todayISODateOnly() {
    const d = new Date();
    return `${d.getFullYear()}-${to2(d.getMonth() + 1)}-${to2(d.getDate())}`;
}

export default function PromotionEditor({ mode, id }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [code, setCode] = useState("");
    const [dtype, setDtype] = useState<PromotionType>("fixed");
    const [amount, setAmount] = useState<string>("");
    const [percent, setPercent] = useState<string>("");
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

    function validateFuture(expISO: string | null): string | null {
        if (!expISO) return null;
        const t = new Date(expISO).getTime();
        if (Number.isNaN(t)) return "วันหมดอายุไม่ถูกต้อง";
        if (t <= Date.now()) return "วัน/เวลา ที่เลือกต้องมากกว่าปัจจุบัน";
        return null;
    }

    async function submit() {
        if (saving) return;
        if (!code.trim()) { alert("กรุณากรอก Promotion Code"); return; }
        if (!/^[A-Za-z0-9_-]+$/.test(code)) { alert("รหัสอนุญาตเฉพาะ A-Z a-z 0-9 _ -"); return; }

        const val = dtype === "fixed" ? Number(amount || 0) : Number(percent || 0);
        if (Number.isNaN(val)) { alert("กรอกจำนวนส่วนลดไม่ถูกต้อง"); return; }
        if (dtype === "percent" && (val < 0 || val > 100)) { alert("เปอร์เซนต์ต้องอยู่ระหว่าง 0–100"); return; }
        if (dtype === "fixed" && val < 0) { alert("จำนวนเงินต้องมากกว่าหรือเท่ากับ 0"); return; }
        if (usageLimit !== "" && (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) < 0)) {
            alert("โควต้าต้องเป็นจำนวนเต็ม >= 0 หรือเว้นว่าง"); return;
        }

        const expire_at = mergeDateTime(expireDate, expireTime);
        const vErr = validateFuture(expire_at);
        if (vErr) { alert(vErr); return; }

        const payload: PromotionCreatePayload = {
            code: code.trim(),
            discount_type: dtype,
            discount_value: val,
            usage_limit: usageLimit === "" ? null : Number(usageLimit),
            expire_at,
        };

        // setSaving(true);
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

    const today = new Date();
    const todayStr = `${to2(today.getDate())}-${to2(today.getMonth() + 1)}-${today.getFullYear()}`;
    const pickingToday = expireDate === todayStr;
    const minTimeHHMM = `${to2(today.getHours())}:${to2(today.getMinutes())}`;

    const handleTimeChange = (v: string) => {
        if (!pickingToday) { setExpireTime(v); return; }
        const [hh, mm] = v.split(":").map(Number);
        const now = new Date();
        const nowHH = now.getHours();
        const nowMM = now.getMinutes();
        if (Number.isFinite(hh) && Number.isFinite(mm)) {
            if (hh < nowHH || (hh === nowHH && mm <= nowMM)) {
                const n = new Date(now.getTime() + 60_000);
                setExpireTime(`${to2(n.getHours())}:${to2(n.getMinutes())}`);
                return;
            }
        }
        setExpireTime(v);
    };

    function parseDDMMYYYY(s: string): Date | null {
        const [dd, mm, yyyy] = s.split("/").map(Number);
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, (mm ?? 1) - 1, dd ?? 1, 0, 0, 0, 0);
    }

    // min date เป็นวันนี้
    const minDateISO = useMemo(() => {
        const todayISO = todayISODateOnly();
        if (mode === "edit" && expireDate) {
            const d = parseDDMMYYYY(expireDate);
            if (d && d.getTime() < new Date(todayISO).getTime()) {
                return undefined;
            }
        }
        return todayISO;
    }, [mode, expireDate]);

    return (
        <>
            <form
                id="promotion-form"
                onSubmit={(e) => { e.preventDefault(); void submit(); }}
                className=" bg-white p-6 py-10 rounded-lg border shadow-[0_10px_24px_rgba(0,0,0,.06)]"
            >
                {loading ? (
                    <div className="py-16 text-center text-[var(--gray-500)]">Loading…</div>
                ) : (
                    <div className="grid gap-8">
                        <div className="flex items-center">
                            <div className="w-[229px]">Promotion Code <span className="text-[var(--red)]">*</span></div>
                            <div className="w-[433px]">
                                <InputField
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={15}
                                    className="h-[44px]"
                                />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-[229px] pt-2">ประเภท <span className="text-[var(--red)]">*</span></div>
                            <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-3">
                                    <div className="flex items-center w-[128px] gap-3">
                                        <input
                                            type="radio"
                                            checked={dtype === "fixed"}
                                            onChange={() => setDtype("fixed")}
                                            className="
                                            relative h-5 w-5 appearance-none rounded-full
                                            border-2 border-[var(--gray-400)] bg-white
                                            transition
                                            checked:bg-[var(--blue-600)] checked:border-[var(--blue-600)]
                                            focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]
                                            before:content-[''] before:absolute before:inset-0
                                            before:m-auto before:h-1.5 before:w-1.5 before:rounded-full
                                            before:bg-white before:scale-0 before:transition-transform
                                            checked:before:scale-100
                                            cursor-pointer"
                                            aria-label="Fixed"
                                        />
                                        <span className="cursor-pointer">Fixed</span>
                                    </div>
                                    <div className="w-[140px]">
                                        <InputField
                                            value={amount}
                                            onChange={(e) => setAmount(sanitizeMoney(e.target.value))}
                                            disabled={dtype !== "fixed"}
                                            rightIcon={<span>฿</span>}
                                            className="h-[42px] w-[140px]"
                                            maxLength={5}
                                        />
                                    </div>

                                </label>

                                <label className="flex items-center gap-3">
                                    <div className="flex items-center w-[128px] gap-3">
                                        <input
                                            type="radio"
                                            checked={dtype === "percent"}
                                            onChange={() => setDtype("percent")}
                                            className="
                                            relative h-5 w-5 appearance-none rounded-full
                                            border-2 border-[var(--gray-400)] bg-white
                                            transition
                                            checked:bg-[var(--blue-600)] checked:border-[var(--blue-600)]
                                            focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]
                                            before:content-[''] before:absolute before:inset-0
                                            before:m-auto before:h-1.5 before:w-1.5 before:rounded-full
                                            before:bg-white before:scale-0 before:transition-transform
                                            checked:before:scale-100
                                            cursor-pointer"
                                            aria-label="percent"
                                        />
                                        <span className="cursor-pointer">Percent</span>
                                    </div>
                                    <div className="w-[140px]">
                                        <InputField
                                            value={percent}
                                            onChange={(e) => setPercent(sanitizeMoney(e.target.value))}
                                            disabled={dtype !== "percent"}
                                            rightIcon={<span>%</span>}
                                            className="h-[42px] w-[140px]"
                                            maxLength={2}
                                        />
                                    </div>

                                </label>
                            </div>
                        </div>

                        {/* limit */}
                        <div className="flex items-center">
                            <div className="w-[229px]">โควต้าการใช้</div>
                            <div className="relative">
                                <div className="flex items-center w-[433px]">
                                    <InputField
                                        value={usageLimit}
                                        onChange={(e) => setUsageLimit(sanitizeInt(e.target.value))}
                                        placeholder=" "
                                        className="h-[44px] w-[240px]"
                                        maxLength={3}
                                    />
                                    <span className="absolute right-4 -translate-y-1 text-[var(--gray-300)]">ครั้ง</span>
                                </div>

                            </div>
                        </div>

                        {/* expire */}
                        <div className="flex items-center">
                            <div className="w-[229px]">วันหมดอายุ</div>
                            <div className="flex justify-between items-center w-[433px]">
                                <DatePicker
                                    value={expireDate}
                                    onChange={setExpireDate}
                                    min={minDateISO} // กันย้อนหลัง
                                    placeholder=" "
                                    className="w-[205px]"
                                />
                                <div className="relative">
                                    <TimePicker
                                        value={expireTime}
                                        onChange={handleTimeChange}
                                        placeholder=" "
                                        className="w-[205px]"
                                    />
                                    {pickingToday && (
                                        <span className="absolute mt-2 text-xs text-[var(--gray-400)]">
                                            <span className="text-[var(--red)]">*</span> เลือกได้ตั้งแต่ {minTimeHHMM} เป็นต้นไป
                                        </span>
                                    )}
                                </div>
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

                        {/* ปุ่มล่างยังคงไว้ เผื่อการใช้งาน scroll ยาว */}
                        <ConfirmDialog
                            open={askDelete}
                            title="ลบ Promotion นี้?"
                            description="การลบไม่สามารถย้อนกลับได้"
                            onCancel={() => setAskDelete(false)}
                            onConfirm={confirmDelete}
                            loading={saving}
                        />
                    </div>
                )}
            </form>
            <div className="flex justify-end gap-3">
                {mode === "edit" && (
                    <button
                        type="button"
                        className="flex px-6 py-4 gap-2 text-base text-[var(--gray-600)] font-semibold underline hover:text-[var(--blue-600)] disabled:opacity-60 cursor-pointer"
                        onClick={() => setAskDelete(true)}
                        disabled={saving}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM10 11V17V11ZM14 11V17V11ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z" stroke="#9AA1B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        ลบ Promotion Code
                    </button>
                )}
            </div>
        </>
    );
}
