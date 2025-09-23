// POST /api/services/reorder (mock)
import type { NextApiRequest, NextApiResponse } from "next";
import { getServices, setServices } from "@/server/mock/servicesHome";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();
    try {
        const body = req.body as { id: string; index: number }[];
        const map = new Map(body.map(x => [x.id, x.index]));
        const cur = getServices();

        const next = cur
            .map(s => ({ ...s, index: map.get(s.id) ?? s.index }))
            .sort((a, b) => a.index - b.index);

        setServices(next);
        return res.status(200).json({ ok: true });
    } catch {
        return res.status(400).json({ message: "Bad payload" });
    }
}
