import { useCallback, useEffect, useState } from "react";
import type { LatLng, GeoPermission } from "@/types/geo";

export function useGeolocation() {
    const [coords, setCoords] = useState<LatLng | null>(null);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<GeoPermission>("unknown");
    const [error, setError] = useState<string | null>(null);

    const isSupported = typeof window !== "undefined" && "geolocation" in navigator;

    // เช็ค Permission
    useEffect(() => {
        let active = true;
        async function readPerm() {
            try {
                if ("permissions" in navigator) {
                    const status = await navigator.permissions.query({
                        name: "geolocation" as PermissionName,
                    });
                    if (!active) return;
                    setPermission(
                        status.state === "granted"
                            ? "granted"
                            : status.state === "denied"
                                ? "denied"
                                : "prompt"
                    );
                    status.onchange = () => {
                        setPermission(
                            status.state === "granted"
                                ? "granted"
                                : status.state === "denied"
                                    ? "denied"
                                    : "prompt"
                        );
                    };
                } else {
                    setPermission("unknown");
                }
            } catch {
                setPermission("unknown");
            }
        }
        void readPerm();
        return () => {
            active = false;
        };
    }, []);

    /** trigger ให้ state coords อัปเดต */
    const getCurrentPosition = useCallback(() => {
        if (!isSupported) {
            setError("เบราว์เซอร์ไม่รองรับ Geolocation");
            return;
        }
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLoading(false);
            },
            (err) => {
                setError(err.message || "ไม่สามารถดึงตำแหน่งได้");
                setLoading(false);
            },
            { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
        );
    }, [isSupported]);

    /** รอพิกัดแบบ Promise*/
    const getPositionOnce = useCallback(async (): Promise<LatLng> => {
        if (!isSupported) {
            throw new Error("เบราว์เซอร์ไม่รองรับ Geolocation");
        }
        setLoading(true);
        setError(null);
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
                );
            });
            const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCoords(c);
            return c;
        } catch (e) {
            const msg =
                e instanceof Error
                    ? e.message
                    : typeof e === "string"
                        ? e
                        : "ไม่สามารถดึงตำแหน่งได้";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [isSupported]);

    return {
        coords,
        loading,
        permission,
        error,
        isSupported,
        getCurrentPosition,
        getPositionOnce,
    };
}
