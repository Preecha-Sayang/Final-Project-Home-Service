import { useEffect, useRef, useState } from "react";
import type { GeoPoint } from "@/types/location";
import GoogleMapCanvas from "./GoogleMapCanvas";
import GooglePlaceSearch from "./GooglePlaceSearch";
import { reverseGeocode } from "lib/client/maps/googleProvider";

type PickValue = { point: GeoPoint; place_name?: string };

const DEFAULT_BKK: GeoPoint = { lat: 13.7563, lng: 100.5018 };
const EPS = 1e-7;

export default function GoogleLocationPicker({
    value,
    onChange,
    open,
}: {
    value?: PickValue;
    onChange?: (v: PickValue) => void;
    open?: boolean;
}) {
    const [state, setState] = useState<PickValue>(
        value ?? { point: DEFAULT_BKK, place_name: "" }
    );
    const [addressText, setAddressText] = useState<string>("");

    const timerRef = useRef<number | undefined>(undefined);
    const lastPointRef = useRef<GeoPoint>(state.point);
    const primedRef = useRef(false);

    // เก็บค่าจาก prop ครั้งก่อน เพื่อเทียบว่า prop เปลี่ยนจริงไหม
    const lastPropRef = useRef<PickValue | undefined>(value);

    // sync จาก parent (ดูเฉพาะค่า prop ไม่ดู state เพื่อไม่ให้ทับตำแหน่งที่ลาก)
    useEffect(() => {
        if (!value) return;
        const prev = lastPropRef.current;
        const changed =
            !prev ||
            Math.abs(value.point.lat - prev.point.lat) > EPS ||
            Math.abs(value.point.lng - prev.point.lng) > EPS ||
            value.place_name !== prev.place_name;

        if (changed) {
            setState(value);
            lastPropRef.current = value;
        }
    }, [value]);

    // เปิดโมดอลครั้งแรกแล้ว reverse geocode ให้
    useEffect(() => {
        if (!open) {
            primedRef.current = false;
            return;
        }
        if (primedRef.current) return;
        primedRef.current = true;

        const run = async () => {
            if (addressText && addressText.trim() !== "") return;
            const rev = await reverseGeocode(state.point.lat, state.point.lng);
            const text = rev?.fullText ?? "";
            setAddressText(text);
            onChange?.({ point: state.point, place_name: text });
        };
        void run();
    }, [open, addressText, onChange, state.point]);

    useEffect(() => {
        const changed =
            Math.abs(state.point.lat - lastPointRef.current.lat) > EPS ||
            Math.abs(state.point.lng - lastPointRef.current.lng) > EPS;

        if (!changed) return;
        lastPointRef.current = state.point;

        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(async () => {
            const rev = await reverseGeocode(state.point.lat, state.point.lng);
            const text = rev?.fullText ?? "";
            setAddressText(text);
            onChange?.({ point: state.point, place_name: text });
        }, 250);

        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [state.point, state.point.lat, state.point.lng, onChange]);

    return (
        <div className="space-y-3">
            <GooglePlaceSearch
                onPick={(v) => {
                    setState({ point: v.point, place_name: v.place_name });
                    onChange?.({ point: v.point, place_name: v.place_name });
                }}
            />
            <GoogleMapCanvas
                center={state.point}
                onChange={(p) => setState((s) => ({ ...s, point: p }))}
            />
            <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">ที่อยู่</div>
                <div className="rounded-xl border bg-gray-50 px-3 py-2">
                    {addressText || "—"}
                </div>
            </div>
        </div>
    );
}
