import React from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import type { LatLng } from "@/types/location";
// import MapPickerDialog from "@/components/technician/common/MapPickerDialog";
import { reverseGeocode, formatThaiAddress } from "lib/client/maps/mapboxProvider";
import { http } from "lib/client/http";
import { useTechnicianLocation } from "@/stores/geoStore";

type LocationResp = {
    ok: boolean;
    location: { lat: number; lng: number; address_text: string; updated_at: string } | null;
};

export default function TechnicianSettingsPage() {
    const [open, setOpen] = React.useState(false);
    const [coords, setCoords] = React.useState<LatLng | null>(null);

    // ดึงตำแหน่งล่าสุดจาก store (แชร์กับหน้าอื่น)
    const { addressText, loading, loadFromServer } = useTechnicianLocation();

    React.useEffect(() => {
        void loadFromServer(); // โหลดจาก DB รอบแรก
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveLocation = async (c: LatLng) => {
        setCoords(c);
        // 1) reverse geocode → fullText + meta
        const rev = await reverseGeocode(c.lat, c.lng);
        if (!rev) {
            alert("แปลงพิกัดเป็นที่อยู่ไม่สำเร็จ");
            return;
        }
        const pretty = formatThaiAddress(rev.fullText, rev.meta);

        // 2) POST ไป /api/technician/location
        const r = await http<LocationResp>("/api/technician/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                lat: c.lat,
                lng: c.lng,
                address_text: pretty,
                meta: rev.meta,
            }),
        });

        if (!r.data?.ok) {
            alert("บันทึกตำแหน่งไม่สำเร็จ");
            return;
        }
        // 3) ปิด dialog แล้วโหลดใหม่เพื่อรีเฟรช store
        setOpen(false);
        await loadFromServer();
    };

    return (
        <>
            <PageToolbar title="ตั้งค่าบัญชีผู้ใช้" />

            <div className="p-8">
                <div className="rounded-xl border p-6 bg-white space-y-3">
                    <div className="text-sm text-[var(--gray-700)]">ตำแหน่งที่อยู่ปัจจุบัน</div>

                    <div className="text-sm">
                        {loading ? "กำลังโหลด…" : addressText || (coords ? `Lat: ${coords.lat}, Lng: ${coords.lng}` : "ยังไม่ได้ตั้งค่า")}
                    </div>

                    <div className="flex gap-8">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="w-[200px] h-[40px] rounded-lg border bg-[var(--gray-100)] hover:bg-[var(--gray-200)] text-sm"
                        >
                            เลือกตำแหน่งบนแผนที่
                        </button>
                    </div>
                </div>
            </div>

            {/* Dialog เลือกตำแหน่ง */}
            {/* <MapPickerDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={saveLocation}
                initial={coords}
                title="ปักหมุดตำแหน่งปัจจุบันของคุณ"
            /> */}
        </>
    );
}
