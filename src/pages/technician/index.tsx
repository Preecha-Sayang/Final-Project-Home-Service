import { useEffect, useRef, useState } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTechnicianLocation } from "@/stores/geoStore";
import { useTechJobs } from "@/stores/techJobsStore";
import AvailabilityToggle from "@/components/technician/settings/AvailabilityToggle";
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
        toJSON(): GeolocationPosition {
            return this as unknown as GeolocationPosition;
        },
    };
    return obj as unknown as GeolocationPosition;
}

export default function TechnicianInboxPage() {
    const { addressText, coords, loading, loadFromServer, reverseAndSave } = useTechnicianLocation();
    const { getPositionOnce, permission, error } = useGeolocation();
    const { jobs, loadNearby, accept, decline } = useTechJobs();
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // ref กัน loop reverse geocode
    const hasReversedRef = useRef(false);
    const bootRef = useRef(false);

    const isBusy = loading || loadingProfile;

    const looksLikeLatLng = (s?: string | null) =>
        !!s && /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(s);

    // โหลดโปรไฟล์ช่าง (ดูสถานะเปิดรับงาน)
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoadingProfile(true);
                const resp = await fetch("/api/technician/profile", { credentials: "include" });
                const json = await resp.json();
                setIsAvailable(Boolean(json.profile.is_available ?? false));
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingProfile(false);
            }
        };
        void loadProfile();
    }, []);

    // โหลดตำแหน่งจาก DB ครั้งแรก + reverse ถ้ายังเป็นตัวเลข lat,lng
    useEffect(() => {
        if (bootRef.current) return;
        bootRef.current = true;

        (async () => {
            await loadFromServer();
            const { coords, addressText, loading } = useTechnicianLocation.getState();

            if (!loading && coords && looksLikeLatLng(addressText)) {
                console.log("[reverse] after loadFromServer()");
                await reverseAndSave(async () =>
                    toGeoPosition({ lat: coords.lat, lng: coords.lng, accuracy: 5 })
                );
            }

            if (coords) {
                await loadNearby({ lat: coords.lat, lng: coords.lng });
            }
        })();
    }, [loadFromServer, reverseAndSave, loadNearby]);

    // reverse geocode ตอนรันครั้งแรกถ้า addressText ยังเป็นตัวเลข
    useEffect(() => {
        if (hasReversedRef.current) return;

        if (!loading && coords && looksLikeLatLng(addressText)) {
            hasReversedRef.current = true;
            console.log("[reverse] triggered from watcher", { addressText, coords });
            void reverseAndSave(async () =>
                toGeoPosition({ lat: coords.lat, lng: coords.lng, accuracy: 5 })
            );
        }
    }, [loading, coords, addressText, reverseAndSave]);

    const onRefresh = async () => {
        hasReversedRef.current = false; // รีเซ็ตให้ reverse ใหม่ได้
        try {
            const p = await getPositionOnce();
            await reverseAndSave(async () => toGeoPosition({ lat: p.lat, lng: p.lng, accuracy: 5 }));
            await loadNearby({ lat: p.lat, lng: p.lng });
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        }
    };

    const onToggleAvailability = async () => {
        document.location.reload();
    };

    return (
        <>
            <PageToolbar title="คำขอบริการซ่อม" />

            {!isAvailable && (
                <div className="p-8">
                    <AvailabilityToggle onStatusChanged={onToggleAvailability} />
                </div>
            )}

            {isAvailable && (
                <>
                    <div className="flex items-center justify-center mt-5 px-8">
                        <div className="flex items-center justify-between w-[1120px] rounded-xl bg-[var(--blue-100)] border-2 border-[var(--blue-300)] px-6 py-4 mb-6">
                            <div className="flex gap-5 text-[var(--blue-600)]">
                                <div>{/* icon … */}</div>
                                <div>
                                    <div className="font-medium">ตำแหน่งที่อยู่ปัจจุบัน</div>
                                    <div className="text-sm text-[var(--blue-600)]">
                                        {loading ? "กำลังดึงข้อมูล…" : addressText || "—"}
                                    </div>
                                    {permission === "denied" && (
                                        <div className="text-[var(--red-600)] text-sm mt-1">
                                            กรุณาอนุญาตการเข้าถึงตำแหน่ง เพื่อค้นหางานใกล้คุณ
                                        </div>
                                    )}
                                    {error && (
                                        <div className="text-[var(--red-600)] text-sm mt-1">{error}</div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={onRefresh}
                                className="w-[120px] h-[36px] rounded-lg font-medium bg-[var(--blue-200)] border-2 border-[var(--blue-300)] text-[var(--blue-700)] hover:bg-[var(--blue-100)] cursor-pointer transition"
                            >
                                {isBusy ? "กำลังรีเฟรช…" : "รีเฟรช"}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="flex items-center justify-center w-[1120px] rounded-xl border p-6 bg-white">
                            <JobTable
                                jobs={jobs}
                                onAccept={(id) => accept(id)}
                                onDecline={(id) => decline(id)}
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
