import { useEffect, useRef, useState } from "react";
import type { GeoPoint } from "@/types/location";

type Props = {
    open?: boolean;
    origin: GeoPoint;
    destination: GeoPoint;
    destinationName?: string;
    onClose?: () => void;
};

type DirLegLite = { distance?: { text?: string }; duration?: { text?: string } };
type DirResultLite = { routes?: Array<{ legs?: DirLegLite[] }> };

export default function GoogleMapRouteView({
    open = true,
    origin,
    destination,
    destinationName,
    onClose,
}: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
    const [mapUrl, setMapUrl] = useState<string>("");

    useEffect(() => {
        // ถ้า modal ยังไม่เปิด → ไม่ต้อง init map (กัน warning ตอนปิด)
        if (!open) return;
        if (!mapRef.current) return;
        if (typeof window === "undefined") return;
        const g = (window as unknown as { google?: unknown }).google;
        if (!g) return;

        // safe access google reference
        const googleObj = g as {
            maps: {
                Map: new (el: HTMLElement, opts: { zoom?: number; center?: GeoPoint; mapId?: string }) => unknown;
                LatLngBounds: new () => { extend: (p: GeoPoint) => void };
                DirectionsService: new () => {
                    route: (
                        req: { origin: GeoPoint; destination: GeoPoint; travelMode: unknown },
                        cb: (result: unknown, status: unknown) => void
                    ) => void;
                };
                DirectionsRenderer: new (opts: { map: unknown; suppressMarkers?: boolean; polylineOptions?: unknown }) => {
                    setMap: (m: unknown) => void;
                    setDirections: (r: unknown) => void;
                };
                TravelMode: { DRIVING: unknown };
                DirectionsStatus?: { OK: unknown };
                Marker: new (opts: { position: GeoPoint; map: unknown; label?: string; title?: string }) => {
                    setMap: (m: unknown) => void;
                };
                // อาจไม่มี lib 'marker' ก็เลยทำเป็น optional
                marker?: {
                    AdvancedMarkerElement: new (opts: { map: unknown; position: GeoPoint; content?: HTMLElement }) => {
                        map: unknown | null;
                    };
                };
            };
        };

        const map = new googleObj.maps.Map(mapRef.current, {
            zoom: 13,
            center: origin,
            mapId: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string) || undefined,
        });

        // ใช้ AdvancedMarkerElement ได้ถ้ามี lib 'marker' โหลดมาแล้ว
        const makeMarker = (p: GeoPoint, label: string, title: string) => {
            if (googleObj.maps.marker?.AdvancedMarkerElement) {
                const el = document.createElement("div");
                el.style.padding = "4px 8px";
                el.style.borderRadius = "12px";
                el.style.background = "#1d4ed8";
                el.style.color = "#fff";
                el.style.fontSize = "12px";
                el.style.boxShadow = "0 1px 4px rgba(0,0,0,.25)";
                el.textContent = label;
                return new googleObj.maps.marker.AdvancedMarkerElement({
                    map,
                    position: p,
                    content: el,
                });
            }
            // fallback: Marker ปกติ (ยังคงได้, แต่ Google จะเตือนเรื่อง deprecated—เราพยายามเลี่ยงด้วย lib marker)
            return new googleObj.maps.Marker({
                position: p,
                map,
                label,
                title,
            });
        };

        const originMarker = makeMarker(origin, "ช่าง", "ตำแหน่งช่าง");
        const destMarker = makeMarker(destination, "ลูกค้า", destinationName ?? "ตำแหน่งลูกค้า");

        const bounds = new googleObj.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        (map as { fitBounds: (b: unknown) => void }).fitBounds(bounds);

        const directionsService = new googleObj.maps.DirectionsService();
        const directionsRenderer = new googleObj.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5 },
        });

        directionsService.route(
            {
                origin,
                destination,
                travelMode: googleObj.maps.TravelMode.DRIVING,
            },
            (result: unknown, status: unknown) => {
                const isOk =
                    (typeof status === "string" && status === "OK") ||
                    (googleObj.maps.DirectionsStatus && status === googleObj.maps.DirectionsStatus.OK);

                if (isOk) {
                    // setDirections ต้องการชนิดของ Google โดยตรง เราเซฟ cast ผ่าน unknown
                    directionsRenderer.setDirections(result);

                    const r = result as DirResultLite;
                    const leg: DirLegLite | undefined = r.routes?.[0]?.legs?.[0];
                    setRouteInfo({
                        distanceText: leg?.distance?.text ?? "-",
                        durationText: leg?.duration?.text ?? "-",
                    });
                } else {
                    console.error("❌ Directions failed:", status);
                    setRouteInfo(null);
                }
            }
        );

        const mapsUrl =
            `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}` +
            `&destination=${destination.lat},${destination.lng}&travelmode=driving`;
        setMapUrl(mapsUrl);

        return () => {
            directionsRenderer.setMap(null);
            (originMarker as { map?: unknown; setMap?: (m: unknown) => void })?.setMap?.(null);
            (destMarker as { map?: unknown; setMap?: (m: unknown) => void })?.setMap?.(null);
        };
    }, [open, origin, destination, destinationName]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-2xl p-4 w-[min(720px,92vw)]" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-2">เส้นทางช่าง → ลูกค้า</h3>

                <div ref={mapRef} className="w-full h-[420px] rounded-lg" />

                {routeInfo ? (
                    <div className="mt-3 text-sm text-center text-gray-700 space-y-1">
                        {!!destinationName && <div className="text-gray-600">{destinationName}</div>}
                        <div>
                            🚗 ระยะทางประมาณ <b>{routeInfo.distanceText}</b> — ใช้เวลา <b>{routeInfo.durationText}</b>
                        </div>
                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-[var(--blue-700)] underline underline-offset-2"
                        >
                            เปิดใน Google Maps
                        </a>
                    </div>
                ) : (
                    <div className="mt-3 text-sm text-center text-gray-500">คำนวณเส้นทางไม่สำเร็จ</div>
                )}

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-3 py-2 rounded-xl border hover:bg-gray-50 cursor-pointer">
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
