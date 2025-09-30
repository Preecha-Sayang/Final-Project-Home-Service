import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const optId = Number(req.query.id);
    if (!optId || Number.isNaN(optId)) return res.status(400).json({ ok: false, message: "Invalid id" });

    if (req.method === "DELETE") {
        await sql/*sql*/`DELETE FROM service_option WHERE service_option_id = ${optId}`;
        return res.status(200).json({ ok: true });
    }

    if (req.method === "PATCH") {
        const { name, unit, unit_price } = req.body as { name?: string; unit?: string; unit_price?: number | string };
        const price = unit_price != null ? Number(unit_price) : undefined;
        if (price != null && Number.isNaN(price)) return res.status(400).json({ ok: false, message: "invalid price" });

        const rows = await sql/*sql*/`
            UPDATE service_option
            SET name = COALESCE(${name}, name),
                unit = COALESCE(${unit}, unit),
                unit_price = COALESCE(${price}, unit_price)
            WHERE service_option_id = ${optId}
            RETURNING service_option_id
        `;
        if (rows.length === 0) return res.status(404).json({ ok: false, message: "Not found" });
        return res.status(200).json({ ok: true });
    }

    return res.status(405).end();
}