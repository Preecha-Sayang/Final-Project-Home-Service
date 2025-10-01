import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type { CategoryRow } from "@/types/service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const rows = await sql/*sql*/`
            SELECT category_id, name, description, bg_color_hex, text_color_hex, ring_color_hex,
                    create_at, update_at
            FROM service_categories
            ORDER BY category_id ASC
        `;
        return res.status(200).json({ ok: true, categories: rows as CategoryRow[] });
    }

    if (req.method === "POST") {
        const { name, description, bg_color_hex, text_color_hex, ring_color_hex } = req.body as Partial<CategoryRow>;

        if (!name?.trim()) return res.status(400).json({ ok: false, message: "name required" });

        const rows = await sql/*sql*/`
            INSERT INTO service_categories (name, description, bg_color_hex, text_color_hex, ring_color_hex, update_at)
            VALUES (${name.trim()}, ${description ?? null}, ${bg_color_hex ?? null}, ${text_color_hex ?? null}, ${ring_color_hex ?? null}, now())
            RETURNING *
        `;
        return res.status(200).json({ ok: true, category: rows[0] as CategoryRow });
    }

    return res.status(405).end();
}
