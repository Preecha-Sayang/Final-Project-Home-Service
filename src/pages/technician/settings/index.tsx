import React, { useEffect } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import LocationDialog from "@/components/technician/common/LocationDialog";
import type { LatLng } from "@/types/geo";
import { useTechnicianLocation } from "@/stores/techLocationStore";

export default function TechnicianSettingsPage() {
    const [open, setOpen] = React.useState(false);

    const {
        addressText,
        loading,
        error,
        loadFromServer,
        reverseAndSave,
    } = useTechnicianLocation();

    useEffect(() => {
        void loadFromServer();
    }, []);

    const saveLocation = async (c: LatLng) => {
        try {
            await reverseAndSave(async () => c);
            setOpen(false);
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <>
            <PageToolbar title="ตั้งค่าบัญชีผู้ใช้" />
            <div className="p-8">
                <div className="rounded-xl border p-6 bg-white space-y-3">
                    <div className="text-sm text-[var(--gray-700)]">ตำแหน่งที่อยู่ปัจจุบัน</div>

                    {/* แสดงที่อยู่ล่าสุดจาก store (โหลดจาก DB หรือเพิ่งบันทึก) */}
                    <div className="text-sm">
                        {loading ? "กำลังดึงข้อมูล…" : (addressText || "ยังไม่ได้ตั้งค่า")}
                    </div>

                    {/* แจ้ง error (ถ้ามี) */}
                    {error && (
                        <div className="text-sm text-[var(--red-600)]">{error}</div>
                    )}

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            disabled={loading}
                            className="w-[160px] h-[40px] rounded-lg border bg-[var(--gray-100)] hover:bg-[var(--gray-200)] text-sm disabled:opacity-60"
                        >
                            รีเฟรชตำแหน่ง
                        </button>
                    </div>
                </div>
            </div>

            {/* Popup ขอพิกัด/แสดงตัวอย่างค่า ก่อนบันทึกจริง */}
            <LocationDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={saveLocation}
            />
        </>
    );
}
