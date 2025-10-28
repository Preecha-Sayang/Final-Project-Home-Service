import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef } from "react";
import type { GeoPoint } from "@/types/location";

// โหลด libs คงที่ เพื่อเลี่ยง reload warning
const MAP_LIBS: ("places" | "marker")[] = ["places", "marker"];

type AnyLatLng =
    | google.maps.LatLng
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitudeLiteral;

function isLatLngLiteral(
    v: AnyLatLng
): v is google.maps.LatLngLiteral | google.maps.LatLngAltitudeLiteral {
    return typeof (v as google.maps.LatLngLiteral).lat === "number";
}

/** แปลง AnyLatLng -> LatLngLiteral */
function toLiteral(v: AnyLatLng): google.maps.LatLngLiteral {
    if (isLatLngLiteral(v)) {
        return { lat: v.lat, lng: v.lng };
    }
    return { lat: v.lat(), lng: v.lng() };
}

export default function GoogleMapCanvas({
    center,
    onChange,
    className,
    zoom = 15,
}: {
    center: GeoPoint;
    onChange?: (p: GeoPoint) => void;
    className?: string;
    zoom?: number;
}) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: MAP_LIBS,
        language: "th",
        region: "TH",
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const advMarkerRef =
        useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null); // fallback marker
    const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
    const dragListenerRef = useRef<google.maps.MapsEventListener | null>(null);

    const handleMapLoad = (map: google.maps.Map): void => {
        mapRef.current = map;

        // เคลียร์ marker เก่า
        if (advMarkerRef.current) {
            advMarkerRef.current.map = null;
            advMarkerRef.current = null;
        }
        if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
        }

        // ใช้ AdvancedMarkerElement ถ้ามี, ไม่งั้นใช้ Marker ปกติ (fallback)
        if (google.maps.marker?.AdvancedMarkerElement) {
            advMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: center,
                gmpDraggable: true,
            });

            if (dragListenerRef.current) dragListenerRef.current.remove();
            dragListenerRef.current = advMarkerRef.current.addListener(
                "dragend",
                (): void => {
                    const pos = advMarkerRef.current?.position;
                    if (!pos) return;
                    const p = toLiteral(pos as AnyLatLng);
                    onChange?.(p);
                }
            );
        } else {
            markerRef.current = new google.maps.Marker({
                map,
                position: center,
                draggable: true,
            });

            if (dragListenerRef.current) dragListenerRef.current.remove();
            dragListenerRef.current = markerRef.current.addListener(
                "dragend",
                (): void => {
                    const pos = markerRef.current?.getPosition();
                    if (!pos) return;
                    onChange?.({ lat: pos.lat(), lng: pos.lng() });
                }
            );
        }

        // คลิกแผนที่
        if (clickListenerRef.current) clickListenerRef.current.remove();
        clickListenerRef.current = map.addListener(
            "click",
            (e: google.maps.MapMouseEvent): void => {
                const latLng = e.latLng;
                if (!latLng) return;
                const p: GeoPoint = { lat: latLng.lat(), lng: latLng.lng() };

                // อัปเดตตำแหน่งหมุดตามชนิดที่มีอยู่
                if (advMarkerRef.current)
                    advMarkerRef.current.position = p as AnyLatLng;
                if (markerRef.current) markerRef.current.setPosition(p);

                onChange?.(p);
            }
        );
    };

    // อัปเดต marker & pan
    useEffect(() => {
        if (advMarkerRef.current)
            advMarkerRef.current.position = center as AnyLatLng;
        if (markerRef.current) markerRef.current.setPosition(center);
        if (mapRef.current) mapRef.current.panTo(center);
    }, [center.lat, center.lng]);

    // cleanup listeners / marker
    useEffect(() => {
        return () => {
            if (clickListenerRef.current) clickListenerRef.current.remove();
            if (dragListenerRef.current) dragListenerRef.current.remove();
            if (advMarkerRef.current) advMarkerRef.current.map = null;
            if (markerRef.current) markerRef.current.setMap(null);
        };
    }, []);

    if (!isLoaded) {
        return (
            <div
                className={className ?? "w-full h-80 rounded-2xl border grid place-items-center"}
            >
                <span className="text-sm text-gray-600">กำลังโหลดแผนที่…</span>
            </div>
        );
    }

    return (
        <GoogleMap
            onLoad={handleMapLoad}
            mapContainerClassName={className ?? "w-full h-80 rounded-2xl border"}
            center={center}
            zoom={zoom}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                gestureHandling: "greedy", // ให้ลาก/ซูมได้ลื่นขึ้น
                mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
            }}
        />
    );
}
