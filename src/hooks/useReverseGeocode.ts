import { useEffect, useState } from "react";

export function useReverseGeocode(lat?: number, lng?: number) {
    const [text, setText] = useState<string>("");
    useEffect(() => {
        if (typeof lat !== "number" || typeof lng !== "number") return;
        fetch(`/api/geocode/google-reverse?lat=${lat}&lng=${lng}`)
            .then(r => r.json())
            .then(json => setText(json?.results?.[0]?.formatted_address ?? ""))
            .catch(() => { });
    }, [lat, lng]);
    return text;
}

// ไม่ได้ใช้งาน: แทนที่ด้วย Google (/api/geocode/google-reverse)