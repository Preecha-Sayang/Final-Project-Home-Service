import { useEffect, useRef } from "react";
import type { GeoPoint } from "@/types/location";

export default function GooglePlaceSearch({ onPick }: { onPick: (v: { point: GeoPoint; place_name: string }) => void }) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!inputRef.current || !window.google) return;

        const ac = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["formatted_address", "geometry"],
            componentRestrictions: { country: ["th"] },
        });

        const listener = ac.addListener("place_changed", () => {
            const p = ac.getPlace();
            const loc = p.geometry?.location;
            if (loc) {
                onPick({
                    point: { lat: loc.lat(), lng: loc.lng() },
                    place_name: p.formatted_address || "",
                });
            }
        });

        return () => {
            listener.remove();
        };
    }, [onPick]);

    return <input ref={inputRef} placeholder="เช่น เซ็นทรัลลาดพร้าว" className="w-full rounded-xl border px-3 py-2" />;
}


//# ช่องค้นหา Places
