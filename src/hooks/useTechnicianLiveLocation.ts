import { useEffect, useRef } from "react";

export function useTechnicianLiveLocation(enabled: boolean) {
    const watchId = useRef<number | null>(null);
    useEffect(() => {
        if (!enabled || !navigator.geolocation) return;
        watchId.current = navigator.geolocation.watchPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng, accuracy } = pos.coords;
                try {
                    await fetch("/api/technician/location", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lat, lng, accuracy_m: accuracy ?? null, source: "device" })
                    });
                } catch { }
            },
            (err) => { console.warn("geolocation", err); },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
        );
        return () => { if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current); };
    }, [enabled]);
}
