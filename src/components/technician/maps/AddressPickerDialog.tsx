import React from "react";
import MapCanvas from "./MapCanvas";
import { geocodeAddress, reverseGeocode } from "lib/client/maps/mapboxProvider";
import type { Address, GeoPoint, PickedLocation } from "@/types/location";

type Props = {
    open: boolean;
    initialPoint?: GeoPoint;
    initialAddress?: Address;
    onClose: () => void;
    onConfirm: (picked: PickedLocation) => void;
};

const DEFAULT_CENTER: GeoPoint = { lat: 13.7563, lng: 100.5018 }; // กทม.

export default function AddressPickerDialog({ open, initialPoint, initialAddress, onClose, onConfirm }: Props) {
    const [point, setPoint] = React.useState<GeoPoint>(initialPoint ?? DEFAULT_CENTER);
    const [status, setStatus] = React.useState<"idle" | "granted" | "denied">("idle");
    const [search, setSearch] = React.useState<string>("");
    const [addr, setAddr] = React.useState<Address>(initialAddress ?? {
        houseNo: "", road: "", village: "", subDistrict: "", district: "",
        province: "", postalCode: "", fullText: "",
    });

    React.useEffect(() => {
        if (!open) return;
        setAddr(a => ({ ...a, fullText: initialAddress?.fullText ?? "" }));
    }, [open, initialAddress]);

    if (!open) return null;

    const pickGPS = () => {
        if (!navigator.geolocation) { setStatus("denied"); return; }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                setStatus("granted");
                const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPoint(p);
                const t = await reverseGeocode(p.lat, p.lng);
                if (t) setAddr(a => ({ ...a, fullText: t }));
            },
            () => setStatus("denied"),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const searchAddress = async () => {
        const q = buildReadable(addr, search);
        const res = await geocodeAddress(q);
        if (!res) return;
        setPoint({ lat: res.lat, lng: res.lng });
        setAddr(a => ({ ...a, fullText: res.fullText }));
    };

    const handleConfirm = () => {
        onConfirm({
            point,
            address: { ...addr, fullText: addr.fullText || buildReadable(addr) },
            source: "search",
        });
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center">
            <div className="bg-white w-[880px] rounded-2xl shadow-xl">
                <div className="px-6 py-5 border-b">
                    <div className="text-xl font-semibold">ตำแหน่งที่อยู่ปัจจุบัน</div>
                    <div className="text-sm text-gray-500">ใช้เพื่อคำนวณระยะทางและแสดงงานใกล้คุณ</div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* ที่อยู่ละเอียด */}
                    <div className="space-y-3">
                        <Field label="บ้านเลขที่ *" value={addr.houseNo} onChange={v => setAddr({ ...addr, houseNo: v })} />
                        <Field label="หมู่/หมู่บ้าน" value={addr.village ?? ""} onChange={v => setAddr({ ...addr, village: v })} />
                        <Field label="ถนน" value={addr.road ?? ""} onChange={v => setAddr({ ...addr, road: v })} />
                        <Field label="แขวง/ตำบล" value={addr.subDistrict ?? ""} onChange={v => setAddr({ ...addr, subDistrict: v })} />
                        <Field label="เขต/อำเภอ" value={addr.district ?? ""} onChange={v => setAddr({ ...addr, district: v })} />
                        <Field label="จังหวัด" value={addr.province ?? ""} onChange={v => setAddr({ ...addr, province: v })} />
                        <Field label="รหัสไปรษณีย์" value={addr.postalCode ?? ""} onChange={v => setAddr({ ...addr, postalCode: v })} />
                        <div>
                            <div className="text-sm text-gray-600 mb-1">ที่อยู่รวม (สำหรับแสดงผล)</div>
                            <textarea
                                value={addr.fullText}
                                onChange={e => setAddr({ ...addr, fullText: e.target.value })}
                                className="w-full rounded-lg border px-3 py-2 h-[72px]"
                                placeholder="เช่น 332 อาคารเดอะไนท์ทาวเวอร์ เสนานิคม จตุจักร กรุงเทพฯ"
                            />
                        </div>

                        {/* ค้นหา/แปลงที่อยู่เป็นพิกัด */}
                        <div className="flex gap-2">
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="ค้นหาสถานที่/ที่อยู่ (Mapbox)"
                                className="flex-1 rounded-lg border px-3 h-[42px]"
                            />
                            <button onClick={searchAddress} className="px-4 rounded-lg bg-blue-600 text-white">ค้นหา</button>
                        </div>

                        {/* สถานะสิทธิ์ + ค่าพิกัด */}
                        <div className="rounded-lg border px-3 py-2 text-sm">
                            <div>สถานะสิทธิ์: <b>{status}</b></div>
                            <div>Lat: {point.lat.toFixed(6)}</div>
                            <div>Lng: {point.lng.toFixed(6)}</div>
                            <button onClick={pickGPS} className="mt-2 w-full rounded-md border py-2 hover:bg-gray-50">
                                ดึงตำแหน่งอีกครั้ง
                            </button>
                        </div>
                    </div>

                    {/* แผนที่ + หมุดลากได้ */}
                    <div>
                        <MapCanvas
                            center={point}
                            onMarkerDragEnd={p => {
                                setPoint(p);
                                // ไม่เรียก reverse ทุกครั้งเพื่อประหยัด quota
                            }}
                            className="h-[520px]"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-white">ยกเลิก</button>
                    <button onClick={handleConfirm} className="px-5 py-2 rounded-lg bg-blue-600 text-white">ใช้ตำแหน่งนี้</button>
                </div>
            </div>
        </div>
    );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <div className="text-sm text-gray-600 mb-1">{props.label}</div>
            <input
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
                className="w-full rounded-lg border px-3 h-[42px]"
            />
        </div>
    );
}

function buildReadable(a: Address, fallback?: string): string {
    if (fallback && fallback.trim()) return fallback.trim();
    const seg = [
        a.houseNo, a.village, a.road,
        a.subDistrict, a.district, a.province, a.postalCode,
    ].filter(Boolean);
    return seg.join(" ");
}
