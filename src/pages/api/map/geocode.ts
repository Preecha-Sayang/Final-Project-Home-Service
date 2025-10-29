import type { NextApiRequest, NextApiResponse } from "next";

type GoogleGeoResult = {
    status?: string;
    results?: Array<{
        formatted_address?: string;
        geometry?: { location?: { lat?: number; lng?: number } };
    }>;
};

const API_KEY = process.env.GOOGLE_MAPS_SERVER_KEY as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const qRaw = req.query.q;
        const q = typeof qRaw === "string" ? qRaw.trim() : "";
        if (!q) {
            return res.status(400).json({ error: "missing q" });
        }
        if (!API_KEY) {
            return res.status(500).json({ error: "server_key_missing" });
        }

        const url =
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}` +
            `&language=th&region=TH&key=${API_KEY}`;

        const r = await fetch(url);
        const json = (await r.json()) as unknown as GoogleGeoResult;

        if (json.status !== "OK" || !Array.isArray(json.results) || !json.results[0]) {
            return res.status(404).json({ error: "not_found", status: json.status });
        }

        const best = json.results[0];
        const lat = best.geometry?.location?.lat;
        const lng = best.geometry?.location?.lng;
        const address = best.formatted_address;

        if (typeof lat !== "number" || typeof lng !== "number" || !address) {
            return res.status(404).json({ error: "not_found" });
        }

        // คืน address แบบเต็ม (มีบ้านเลขที่/ตรอก/ซอย ถ้า Google ส่งมาให้)
        return res.status(200).json({ lat, lng, address });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "internal_error";
        return res.status(500).json({ error: msg });
    }
}
