import { useState } from "react";
import GoogleLocationPicker from "@/components/location/GoogleLocationPicker";
import type { GeoPoint } from "@/types/location";

export default function NewAddressPage() {
    const [place, setPlace] = useState<{ point: GeoPoint; place_name?: string }>();
    const [label, setLabel] = useState("บ้าน");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    async function save() {
        if (!place) return;
        setLoading(true); setResult("");
        try {
            const r = await fetch("/api/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: null, label,
                    place_name: place.place_name ?? null,
                    lat: place.point.lat, lng: place.point.lng
                })
            });
            const js = await r.json();
            setResult(js.ok ? `บันทึกสำเร็จ (#${js.item.address_id})` : (js.message || "เกิดข้อผิดพลาด"));
        } finally { setLoading(false); }
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <h1 className="text-xl font-semibold">เพิ่มที่อยู่</h1>
            <label className="text-sm">ป้ายชื่อที่อยู่</label>
            <input className="w-full rounded-xl border px-3 py-2" value={label} onChange={e => setLabel(e.target.value)} />
            <GoogleLocationPicker value={place} onChange={setPlace} />
            <button disabled={!place || loading} onClick={save} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-40">
                {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            {result && <p className="text-sm">{result}</p>}
        </div>
    );
}

//# ใช้ GoogleLocationPicker