import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid id." });

    if (req.method !== "DELETE") return res.status(405).end();

    try {
        const rows = await sql/*sql*/`
            DELETE FROM service_option
            WHERE service_option_id = ${id}
            RETURNING service_option_id
        `;
        if (rows.length === 0) return res.status(404).json({ ok: false, message: "Not found." });
        return res.status(200).json({ ok: true });
    } catch (e: any) {
        return res.status(500).json({ ok: false, message: e?.message || "Delete failed." });
    }
}