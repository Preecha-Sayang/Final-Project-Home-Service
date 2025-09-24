// DELETE /api/services/:id (mock)
import type { NextApiRequest, NextApiResponse } from "next";
import { getServices, setServices, getServiceById } from "@/server/mock/servicesHome";
import type { ServiceItem } from "@/types/service";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };

    if (req.method === "GET") {
        const item = getServiceById(id);
        if (!item) return res.status(404).json({ message: "not found" });
        return res.status(200).json(item);
    }

    if (req.method === "PATCH") { //อัปเดตข้อมูลบางส่วนใช้ PATCH
        const cur = getServices();
        const idx = cur.findIndex(x => x.id === id);
        if (idx === -1) return res.status(404).json({ message: "not found" });

        const body = req.body ?? {};
        const now = new Date().toISOString();
        const updated: ServiceItem = {
            ...cur[idx],
            name: body.name ?? cur[idx].name,
            category: body.category ?? cur[idx].category,
            imageUrl: body.imageUrl ?? cur[idx].imageUrl,
            updatedAt: now,
            subItems: Array.isArray(body.subItems)
                ? body.subItems.map((it: any, i: number) => ({
                    id: it.id ?? `${Date.now()}-${i}`,
                    name: String(it.name ?? ""),
                    unitName: String(it.unitName ?? ""),
                    price: Number(it.price ?? 0),
                    index: Number(it.index ?? i + 1),
                }))
                : cur[idx].subItems ?? [],
        };

        const next = [...cur]; next[idx] = updated;
        setServices(next);
        return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
        const next = getServices()
            .filter(x => x.id !== id)
            .map((x, i) => ({ ...x, index: i + 1 }));
        setServices(next);
        return res.status(200).json({ ok: true });
    }

    return res.status(405).end();
}