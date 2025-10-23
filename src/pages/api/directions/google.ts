import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { origin, destination, mode = "DRIVING" } = req.query;
    const key = process.env.GOOGLE_MAPS_SERVER_KEY;
    if (!origin || !destination) return res.status(400).json({ ok: false, message: "origin/destination required" });
    if (!key) return res.status(500).json({ ok: false, message: "No server key" });

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&language=th&departure_time=now&key=${key}`;
    const r = await fetch(url);
    const json = await r.json();
    res.status(200).json(json);
}


//# proxy directions (option, สำหรับช่างดูเวลา)