// กล่องแผนที่
import React from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GeoPoint } from "@/types/location";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type Props = {
    center: GeoPoint;
    onMarkerDragEnd?: (p: GeoPoint) => void;
    className?: string;
};

export default function MapCanvas({ center, onMarkerDragEnd, className }: Props) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<Map | null>(null);
    const markerRef = React.useRef<Marker | null>(null);

    React.useEffect(() => {
        if (!ref.current) return;
        const map = new mapboxgl.Map({
            container: ref.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [center.lng, center.lat],
            zoom: 14,
        });
        mapRef.current = map;

        const mk = new mapboxgl.Marker({ draggable: true })
            .setLngLat([center.lng, center.lat])
            .addTo(map);

        markerRef.current = mk;

        mk.on("dragend", () => {
            const p = mk.getLngLat();
            onMarkerDragEnd?.({ lat: p.lat, lng: p.lng });
        });

        return () => { mk.remove(); map.remove(); };
    }, []); // สร้างครั้งเดียว

    React.useEffect(() => {
        // อัปเดตตำแหน่งเมื่อ center เปลี่ยน
        const map = mapRef.current;
        const mk = markerRef.current;
        if (!map || !mk) return;
        mk.setLngLat([center.lng, center.lat]);
        map.flyTo({ center: [center.lng, center.lat], zoom: 14 });
    }, [center]);

    return <div ref={ref} className={className ?? "h-[380px] w-full rounded-lg overflow-hidden"} />;
}
