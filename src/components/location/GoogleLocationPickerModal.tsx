import { useState, useEffect, useRef } from "react";
import GoogleLocationPicker from "./GoogleLocationPicker";
import type { GeoPoint } from "@/types/location";

type Picked = { point: GeoPoint; place_name?: string };

export default function GoogleLocationPickerModal({
    open, onClose, onConfirm, initial,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: (v: Picked) => void;
    initial?: Picked;
}) {
    const [selected, setSelected] = useState<Picked | null>(initial ?? null);
    const prevOpen = useRef<boolean>(false);
    const lastInit = useRef<Picked | undefined>(undefined);

    useEffect(() => {
        const becameOpen = !prevOpen.current && open;
        const initChanged =
            (!!initial && !!lastInit.current &&
                (initial.point.lat !== lastInit.current.point.lat ||
                    initial.point.lng !== lastInit.current.point.lng ||
                    initial.place_name !== lastInit.current.place_name)) ||
            (initial && !lastInit.current) || (!initial && lastInit.current);

        if (becameOpen || initChanged) {
            setSelected(initial ?? null);
            lastInit.current = initial;
        }
        prevOpen.current = open;
    }, [open, initial]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-[min(760px,92vw)] rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-2">เลือกตำแหน่ง</h3>

                <GoogleLocationPicker
                    value={selected ?? undefined}
                    onChange={(v) => setSelected(v)}
                    open={open}
                />

                <div className="mt-4 flex justify-end gap-2">
                    <button className="px-3 py-2 rounded-xl border hover:bg-gray-50 cursor-pointer" onClick={onClose}>
                        ยกเลิก
                    </button>
                    <button
                        className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-40 hover:bg-black/90 cursor-pointer"
                        disabled={!selected}
                        onClick={() => { if (selected) onConfirm(selected); onClose(); }}
                    >
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    );
}