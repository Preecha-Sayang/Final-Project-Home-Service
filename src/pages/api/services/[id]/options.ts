import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid id" });

    if (req.method !== "GET") return res.status(405).end();

    try {
        const rows = await sql/*sql*/`
            SELECT service_option_id, service_id, name, unit, unit_price, create_at, update_at
            FROM service_option
            WHERE service_id = ${id}
            ORDER BY service_option_id ASC
        `;
        return res.status(200).json({ ok: true, options: rows });
    } catch (e: any) {
        return res.status(500).json({ ok: false, message: e?.message || "Get options failed" });
    }
}