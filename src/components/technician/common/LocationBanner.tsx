import React from "react";
import type { PickedLocation } from "@/types/location";

type Props = {
    location?: PickedLocation | null;
    onRefresh: () => void;
    onOpenPicker: () => void;
};

export default function LocationBanner({ location, onRefresh, onOpenPicker }: Props) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
            <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">📍</span>
                <div className="text-sm">
                    <div className="text-blue-600 font-medium">ตำแหน่งที่อยู่ปัจจุบัน</div>
                    <div className="text-gray-700">
                        {location?.address.fullText || "ยังไม่ตั้งค่า"}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onOpenPicker} className="rounded-lg border px-3 h-[36px]">แก้ไข/ปักหมุด</button>
                <button onClick={onRefresh} className="rounded-lg bg-blue-600 text-white px-4 h-[36px]">รีเฟรช</button>
            </div>
        </div>
    );
}
