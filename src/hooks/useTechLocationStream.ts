import { useEffect, useState } from "react";

type TechLocation = {
    lat?: number;
    lng?: number;
    admin_id?: number;
    name?: string;
    [k: string]: unknown;
};

type StreamPacket =
    | { type: "tech_locations"; items?: TechLocation[] }
    | { type: string;[k: string]: unknown };

function isTechLocationArray(u: unknown): u is TechLocation[] {
    return Array.isArray(u) && u.every((x) => x !== null && typeof x === "object");
}

function parsePacket(jsonText: string): StreamPacket | null {
    try {
        const data: unknown = JSON.parse(jsonText);
        if (data && typeof data === "object" && "type" in data) {
            const pkt = data as StreamPacket;
            return pkt;
        }
        return null;
    } catch {
        return null;
    }
}

export function useTechLocationStream() {
    const [items, setItems] = useState<TechLocation[]>([]);
    useEffect(() => {
        const es = new EventSource("/api/technician/location/stream");
        es.onmessage = (e) => {
            try {
                const pkt = parsePacket(e.data);
                if (pkt?.type === "tech_locations") {
                    setItems(isTechLocationArray(pkt.items) ? pkt.items : []);
                }
            } catch { }
        };
        es.onerror = () => {
            /* เงียบหรือ retry */
        };
        return () => es.close();
    }, []);
    return items;
}
