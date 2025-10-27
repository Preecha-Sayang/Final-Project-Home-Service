import type { NextApiRequest, NextApiResponse } from "next";
import { getDirections } from "lib/server/maps/google";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { origin, destination } = req.body;
        const result = await getDirections(origin, destination);
        return res.status(200).json(result);
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
}
