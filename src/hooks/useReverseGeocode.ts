import { useEffect, useState } from "react";

export function useReverseGeocode(lat?: number, lng?: number) {
    const [text, setText] = useState<string>("");
    useEffect(() => {
        if (typeof lat !== "number" || typeof lng !== "number") return;
        const url = `/api/geocode/reverse?lat=${lat}&lng=${lng}`;
        fetch(url).then(r => r.json()).then(json => {
            const name = json?.features?.[0]?.place_name ?? "";
            setText(name);
        }).catch(() => { });
    }, [lat, lng]);
    return text;
}

// ไม่ได้ใช้งาน: แทนที่ด้วย Google (/api/geocode/google-reverse)