import { useEffect, useState } from "react";

export function useTechLocationStream() {
    const [items, setItems] = useState<any[]>([]);
    useEffect(() => {
        const es = new EventSource("/api/technician/location/stream");
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data?.type === "tech_locations") setItems(data.items || []);
            } catch { }
        };
        es.onerror = () => { /* เงียบหรือ retry */ };
        return () => es.close();
    }, []);
    return items;
}
