// DELETE /api/services/:id (mock)
import type { NextApiRequest, NextApiResponse } from "next";
import { getServices, setServices } from "@/server/mock/servicesHome";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") return res.status(405).end();

    const { id } = req.query as { id: string };
    const cur = getServices();

    const next = cur
        .filter(x => x.id !== id)
        .map((x, i) => ({ ...x, index: i + 1 }));

    setServices(next);
    return res.status(200).json({ ok: true });
}
