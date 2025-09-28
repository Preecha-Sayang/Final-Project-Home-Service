import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();
    try {
        const rows = await sql/*sql*/`
            SELECT category_id, name
            FROM service_categories
            ORDER BY category_id ASC
        `;
        return res.status(200).json({ ok: true, categories: rows });
    } catch (e: any) {
        return res.status(500).json({ ok: false, message: e?.message || "Get categories failed" });
    }
}