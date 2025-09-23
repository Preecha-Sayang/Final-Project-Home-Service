// GET /api/services (mock)
import type { NextApiRequest, NextApiResponse } from "next";
import { getServices, setServices } from "@/server/mock/servicesHome";
import type { ServiceItem } from "@/types/service";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        return res.status(200).json(getServices());
    }
    if (req.method === "POST") {
        const { name, category, imageUrl, subItems } = req.body ?? {};
        if (!String(name).trim() || !String(category).trim()) {
            return res.status(400).json({ message: "name/category required" });
        }
        const cur = getServices();
        const now = new Date().toISOString();
        const newItem: ServiceItem = {
            id: String(Date.now()),
            index: cur.length + 1,
            name: String(name).trim(),
            category: String(category).trim(),
            imageUrl: imageUrl ?? "",
            createdAt: now, updatedAt: now,
            subItems: Array.isArray(subItems)
                ? subItems.map((it: any, i: number) => ({
                    id: it.id ?? `${Date.now()}-${i}`,
                    name: String(it.name ?? ""),
                    unitName: String(it.unitName ?? ""),
                    price: Number(it.price ?? 0),
                    index: Number(it.index ?? i + 1),
                }))
                : [],
        };
        setServices([...cur, newItem]);
        return res.status(201).json(newItem);
    }

    return res.status(405).end();
}