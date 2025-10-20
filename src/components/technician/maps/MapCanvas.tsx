// กล่องแผนที่
import React, { useEffect, useRef } from "react";
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
    const ref = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);
    const markerRef = useRef<Marker | null>(null);

    // เก็บค่าเริ่มต้นของ center ใช้ตอน mount เท่านั้น
    const initialCenter = useRef(center);

    // เก็บ handler เป็น ref เพื่อไม่ให้เป็น dependency
    const dragEndRef = useRef<((p: GeoPoint) => void) | null>(null);

    useEffect(() => {
        dragEndRef.current = onMarkerDragEnd ?? null;
    }, [onMarkerDragEnd]);

    // สร้างแผนที่ครั้งเดียว
    useEffect(() => {
        if (!ref.current) return;
        const map = new mapboxgl.Map({
            container: ref.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [initialCenter.current.lng, initialCenter.current.lat],
            zoom: 14,
        });
        mapRef.current = map;

        const mk = new mapboxgl.Marker({ draggable: true })
            .setLngLat([initialCenter.current.lng, initialCenter.current.lat])
            .addTo(map);
        markerRef.current = mk;

        mk.on("dragend", () => {
            const p = mk.getLngLat();
            dragEndRef.current?.({ lat: p.lat, lng: p.lng });
        });

        return () => { mk.remove(); map.remove(); };
    }, []);

    // อัปเดตตำแหน่งเมื่อ center เปลี่ยน
    useEffect(() => {
        const map = mapRef.current, mk = markerRef.current;
        if (!map || !mk) return;
        mk.setLngLat([center.lng, center.lat]);
        map.flyTo({ center: [center.lng, center.lat], zoom: 14 });
    }, [center]);

    return <div ref={ref} className={className ?? "h-[380px] w-full rounded-lg overflow-hidden"} />;
}