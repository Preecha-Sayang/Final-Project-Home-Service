import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type { UnitRow } from "@/types/service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        // ถ้ามีตาราง service_units ใช้อันนี้ก่อน
        const hasTable = await sql/*sql*/`
            SELECT to_regclass('public.service_units') AS t
        `;
        if (hasTable[0]?.t) {
            const u = await sql/*sql*/`
                SELECT unit_id, name 
                FROM service_units 
                ORDER BY name ASC
            `;
            return res.status(200).json({ ok: true, units: u as UnitRow[] });
        }
        // fallback: distinct จาก service_option
        const d = await sql/*sql*/`
            SELECT DISTINCT unit AS name 
            FROM service_option 
            WHERE unit IS NOT NULL AND unit <> '' 
            ORDER BY name ASC
        `;
        const faux = (d as { name: string }[]).map((x, i) => ({ unit_id: i + 1, name: x.name }));
        return res.status(200).json({ ok: true, units: faux });
    }

    if (req.method === "POST") {
        const { name } = req.body as { name?: string };
        if (!name?.trim()) return res.status(400).json({ ok: false, message: "name required." });
        const rows = await sql/*sql*/`
            INSERT INTO service_units (name) VALUES (${name.trim()})
            ON CONFLICT (name) DO NOTHING
            RETURNING unit_id, name
        `;
        return res.status(200).json({ ok: true, unit: rows[0] ?? null });
    }

    return res.status(405).end();
}
