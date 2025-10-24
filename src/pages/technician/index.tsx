import { useEffect, useRef, useState } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTechnicianLocation } from "@/stores/geoStore";
import { useTechJobs } from "@/stores/techJobsStore";
import JobTable from "@/components/technician/jobs/JobTable";

function toGeoPosition(p: { lat: number; lng: number; accuracy?: number }): GeolocationPosition {
    const obj = {
        coords: {
            latitude: p.lat,
            longitude: p.lng,
            accuracy: p.accuracy ?? 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
        },
        timestamp: Date.now(),
        toJSON() { return this as any; },
    };
    return obj as unknown as GeolocationPosition;
}

export default function TechnicianInboxPage() {
    const [q, setQ] = useState("");
    const { addressText, coords, loading, loadFromServer, reverseAndSave } = useTechnicianLocation();
    const { getPositionOnce, permission, error } = useGeolocation();
    const { jobs, loadNearby, accept, decline } = useTechJobs();

    // โหลดข้อมูลจาก DB เมื่อเข้าเพจ (ครั้งเดียว)
    const bootRef = useRef(false);
    useEffect(() => {
        if (bootRef.current) return;
        bootRef.current = true;
        void loadFromServer();
    }, [loadFromServer]);

    // เมื่อได้ coords จาก DB แล้ว → ค่อยโหลดงานใกล้ตัว
    useEffect(() => {
        if (coords?.lat != null && coords?.lng != null) {
            void loadNearby({ lat: coords.lat, lng: coords.lng });
        }
    }, [coords?.lat, coords?.lng, loadNearby]);

    // ปุ่มรีเฟรช: ค่อยใช้ตำแหน่งจากอุปกรณ์ แล้วบันทึก + โหลดงานใหม่
    const onRefresh = async () => {
        try {
            const p = await getPositionOnce();
            await reverseAndSave(async () => toGeoPosition({ lat: p.lat, lng: p.lng, accuracy: 5 }));
            await loadNearby({ lat: p.lat, lng: p.lng });
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
                        onClick={onRefresh}
                    >
                        รีเฟรช
                    </button>
                }
            />

            <div className="px-8">
                <div className="flex items-center justify-between rounded-xl bg-[var(--blue-50)] border border-[var(--blue-100)] px-6 py-4 mb-6">
                    <div className="text-[var(--blue-800)]">
                        <div className="font-medium">ตำแหน่งที่อยู่ปัจจุบัน</div>
                        <div className="text-[var(--blue-900)]">
                            {loading ? "กำลังดึงข้อมูล…" : addressText || "—"}
                        </div>
                        {permission === "denied" && (
                            <div className="text-[var(--red-600)] text-sm mt-1">
                                กรุณาอนุญาตการเข้าถึงตำแหน่ง เพื่อค้นหางานใกล้คุณ
                            </div>
                        )}
                        {error && <div className="text-[var(--red-600)] text-sm mt-1">{error}</div>}
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
                <div className="rounded-xl border p-6 bg-white">
                    <JobTable
                        jobs={jobs.filter((j) => (q ? (j.address_text ?? "").includes(q) : true))}
                        onAccept={accept}
                        onDecline={decline}
                    />
                </div>
            </div>
        </>
    );
}
