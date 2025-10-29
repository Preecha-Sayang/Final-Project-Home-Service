import type { NextApiRequest, NextApiResponse } from "next";
import { getDirections } from "lib/server/maps/google";

type GeoPoint = { lat: number; lng: number };
type DirectionsReqBody = { origin: GeoPoint; destination: GeoPoint };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { origin, destination } = req.body as DirectionsReqBody;
        const result = await getDirections(origin, destination);
        return res.status(200).json(result);
    } catch (e: unknown) {
        console.error(e);
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ error: message });
    }
}