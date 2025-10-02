import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type { CategoryRow } from "@/types/service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid id." });

    if (req.method === "GET") {
        const rows = await sql/*sql*/`
            SELECT * FROM service_categories 
            WHERE category_id = ${id}
        `;
        if (rows.length === 0) return res.status(404).json({ ok: false, message: "Not found." });
        return res.status(200).json({ ok: true, category: rows[0] as CategoryRow });
    }

    if (req.method === "PATCH") {
        const { name, description, bg_color_hex, text_color_hex, ring_color_hex } = req.body as Partial<CategoryRow>;

        const rows = await sql/*sql*/`
            UPDATE service_categories
            SET name = ${name ?? null},
                description = ${description ?? null},
                bg_color_hex = ${bg_color_hex ?? null},
                text_color_hex = ${text_color_hex ?? null},
                ring_color_hex = ${ring_color_hex ?? null},
                update_at = now()
            WHERE category_id = ${id}
            RETURNING *
        `;
        return res.status(200).json({ ok: true, category: rows[0] as CategoryRow });
    }

    if (req.method === "DELETE") {
        await sql/*sql*/`
            DELETE FROM service_categories 
            WHERE category_id = ${id}
        `;
        return res.status(200).json({ ok: true });
    }

    return res.status(405).end();
}
