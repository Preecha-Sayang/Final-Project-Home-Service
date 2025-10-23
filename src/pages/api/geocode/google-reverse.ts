import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { lat, lng } = req.query;
    const key = process.env.GOOGLE_MAPS_SERVER_KEY;
    if (!lat || !lng) return res.status(400).json({ ok: false, message: "lat/lng required" });
    if (!key) return res.status(500).json({ ok: false, message: "No server key" });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=th&key=${key}`;
    const r = await fetch(url);
    const json = await r.json();
    res.status(200).json(json);
}

//# proxy reverse geocoding