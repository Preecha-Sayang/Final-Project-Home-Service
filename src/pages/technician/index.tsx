import React, { useEffect } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTechnicianLocation } from "@/stores/techLocationStore";

export default function TechnicianInboxPage() {
    const [q, setQ] = React.useState("");
    const { addressText, loading, loadFromServer, reverseAndSave } = useTechnicianLocation();
    const { getPositionOnce, permission, error } = useGeolocation();

    // โหลดจาก DB ครั้งแรก (ดึง address ล่าสุดจากเซิร์ฟเวอร์มาโชว์)
    useEffect(() => {
        void loadFromServer();
    }, []);

    const onRefresh = async () => {
        try {
            await reverseAndSave(getPositionOnce);
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <>
            <PageToolbar
                title="คำขอบริการซ่อม"
                searchValue={q}
                onSearchChange={(v) => setQ(v)}
                rightSlot={
                    <button
                        type="button"
                        className="w-[148px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                        onClick={() => alert("TODO: filter")}
                    >
                        ตัวกรอง
                    </button>
                }
            />

            {/* แบนเนอร์ที่อยู่ปัจจุบัน */}
            <div className="px-8">
                <div className="flex items-center justify-between rounded-xl bg-[var(--blue-50)] border border-[var(--blue-100)] px-6 py-4 mb-6">
                    <div className="text-[var(--blue-800)]">
                        <div className="font-medium">ตำแหน่งที่อยู่ปัจจุบัน</div>
                        <div className="text-[var(--blue-900)]">
                            {loading ? "กำลังดึงข้อมูล…" : addressText || "—"}
                        </div>
                        {permission === "denied" && (
                            <div className="text-[var(--red-600)] text-sm mt-1">
                                เบราว์เซอร์ปิดสิทธิ์ระบุตำแหน่ง
                            </div>
                        )}
                        {error && (
                            <div className="text-[var(--red-600)] text-sm mt-1">{error}</div>
                        )}
                    </div>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onRefresh}
                        className="w-[96px] h-[36px] rounded-lg bg-white border border-[var(--blue-300)] text-[var(--blue-700)] hover:bg-[var(--blue-50)]"
                    >
                        {loading ? "กำลังรีเฟรช…" : "รีเฟรช"}
                    </button>
                </div>
            </div>

            <div className="p-8">
                <div className="rounded-xl border p-6 bg-white">รายการงานใกล้คุณ…</div>
            </div>
        </>
    );
}
