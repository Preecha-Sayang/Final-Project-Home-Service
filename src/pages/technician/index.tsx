import { useEffect, useRef, useState } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTechnicianLocation } from "@/stores/geoStore";
import { useTechJobs } from "@/stores/techJobsStore";
import JobTable from "@/components/technician/jobs/JobTable";

export default function TechnicianInboxPage() {
    const [q, setQ] = useState("");
    const { addressText, loading, loadFromServer, reverseAndSave, coords } =
        useTechnicianLocation();
    const { getPositionOnce, permission, error } = useGeolocation();
    const { jobs, loadNearby, accept, decline } = useTechJobs();

    // โหลดตำแหน่งครั้งแรก
    const loadRef = useRef(loadFromServer);
    useEffect(() => {
        loadRef.current = loadFromServer;
    }, [loadFromServer]);
    useEffect(() => {
        void loadRef.current();
    }, []);

    // มีพิกัดแล้วค่อยโหลดงาน
    useEffect(() => {
        if (coords) void loadNearby({ lat: coords.lat, lng: coords.lng });
    }, [coords, loadNearby]);

    const onRefresh = async () => {
        try {
            await reverseAndSave(async () => {
                const p = await getPositionOnce();
                return {
                    coords: { latitude: p.lat, longitude: p.lng, accuracy: 5 },
                    timestamp: Date.now(),
                    toJSON() {
                        return this;
                    },
                } as GeolocationPosition;
            });

            // ใช้ค่าจาก store หลังอัปเดต
            const latest = useTechnicianLocation.getState().coords;
            if (latest) {
                void loadNearby({ lat: latest.lat, lng: latest.lng });
            }
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
                <div className="rounded-xl border p-6 bg-white">
                    <JobTable
                        jobs={jobs.filter((j) =>
                            q ? (j.address_text ?? "").includes(q) : true
                        )}
                        onAccept={(id) => void accept(id)}
                        onDecline={(id) => void decline(id)}
                    />
                </div>
            </div>
        </>
    );
}
