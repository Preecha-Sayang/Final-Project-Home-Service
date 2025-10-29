import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const rows = await sql/*sql*/`
        SELECT DISTINCT unit
        FROM service_option
        WHERE unit IS NOT NULL AND TRIM(unit) <> ''
        ORDER BY unit ASC
    ` as { unit: string }[];
    return res.status(200).json({ ok: true, units: rows.map(r => r.unit) });
}
