// GET /api/services (mock)
import type { NextApiRequest, NextApiResponse } from "next";
import { getServices } from "@/server/mock/servicesHome";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();
    return res.status(200).json(getServices());
}
