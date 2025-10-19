import React from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { LatLng } from "@/types/geo";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm?: (coords: LatLng) => void; // ส่งพิกัดให้หน้าเรียกใช้
};

/** ป็อปอัพดึงพิกัดด้วย Geolocation API */
export default function LocationDialog({ open, onClose, onConfirm }: Props) {
    const { coords, loading, permission, error, getCurrentPosition } = useGeolocation();

    React.useEffect(() => {
        if (open) getCurrentPosition();
    }, [open, getCurrentPosition]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-[var(--gray-200)] shadow-lg">
                <div className="px-6 py-4 border-b">
                    <div className="text-lg font-semibold">ตำแหน่งที่อยู่ปัจจุบัน</div>
                    <div className="text-sm text-[var(--gray-500)]">ใช้เพื่อคำนวณระยะทางและแสดงงานใกล้คุณ</div>
                </div>

                <div className="px-6 py-5 space-y-2">
                    <div className="text-sm">
                        สถานะสิทธิ์: <b>{permission}</b>
                    </div>
                    {loading && <div className="text-sm text-[var(--gray-600)]">กำลังดึงพิกัด…</div>}
                    {error && <div className="text-sm text-[var(--red)]">{error}</div>}
                    {coords && (
                        <div className="rounded-lg bg-[var(--gray-50)] border px-3 py-2 text-sm">
                            <div>Lat: {coords.lat.toFixed(6)}</div>
                            <div>Lng: {coords.lng.toFixed(6)}</div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={getCurrentPosition}
                        className="w-full h-[40px] rounded-md border bg-[var(--gray-100)] hover:bg-[var(--gray-200)] text-sm font-medium cursor-pointer"
                    >
                        ดึงตำแหน่งอีกครั้ง
                    </button>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-[40px] px-4 rounded-md border text-sm cursor-pointer hover:bg-[var(--gray-100)]"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        disabled={!coords}
                        onClick={() => { if (coords) onConfirm?.(coords); onClose(); }}
                        className="h-[40px] px-4 rounded-md bg-[var(--blue-600)] text-white text-sm font-medium hover:bg-[var(--blue-700)] disabled:opacity-60 cursor-pointer"
                    >
                        ใช้ตำแหน่งนี้
                    </button>
                </div>
            </div>
        </div>
    );
}
