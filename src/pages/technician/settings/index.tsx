import { useEffect, useState, useMemo } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import { reverseGeocode, formatThaiAddress } from "lib/client/maps/googleProvider";
import { useTechnicianLocation } from "@/stores/geoStore";
import GoogleLocationPickerModal from "@/components/location/GoogleLocationPickerModal";

type SelectedLocation = {
    point: { lat: number; lng: number };
    place_name?: string;
};

export default function TechnicianSettingsPage() {
    const [open, setOpen] = useState(false);
    const { addressText, coords, loading, loadFromServer } = useTechnicianLocation();

    useEffect(() => { void loadFromServer(); }, [loadFromServer]);

    const saveSelected = async (v: SelectedLocation) => {
        const { lat, lng } = v.point;
        const rev = await reverseGeocode(lat, lng);
        const pretty = formatThaiAddress(rev?.fullText || v.place_name || `${lat}, ${lng}`, rev?.meta);

        const r = await fetch("/api/technician/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lat, lng, address_text: pretty, meta: rev?.meta }),
        });
        const js: { ok: boolean } = await r.json();
        if (!js?.ok) {
            alert("บันทึกตำแหน่งไม่สำเร็จ");
            return;
        }
        await loadFromServer();
    };

    const initial = useMemo(() => {
        return coords ? { point: coords, place_name: addressText || undefined } : undefined;
    }, [coords?.lat, coords?.lng, addressText]);

    return (
        <>
            <PageToolbar title="ตั้งค่าบัญชีผู้ใช้" />

            <div className="p-8">
                <div className="rounded-xl border p-6 bg-white space-y-3">
                    <div className="text-sm text-[var(--gray-700)]">ตำแหน่งที่อยู่ปัจจุบัน</div>
                    <div className="text-sm">
                        {loading ? "กำลังโหลด…" : addressText || "ยังไม่ได้ตั้งค่า"}
                    </div>

                    <div className="flex gap-8">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="w-[200px] h-[40px] rounded-lg border bg-[var(--gray-100)] hover:bg-[var(--gray-200)] text-sm cursor-pointer"
                        >
                            เลือกตำแหน่งบนแผนที่
                        </button>
                    </div>
                </div>
            </div>

            <GoogleLocationPickerModal
                open={open}
                onClose={() => setOpen(false)}
                initial={initial}
                onConfirm={(v) => { void saveSelected(v); }}
            />
        </>
    );
}