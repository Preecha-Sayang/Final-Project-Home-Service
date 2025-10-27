import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type { CategoryRow, CategoryUpdatePayload } from "@/types/category";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid id." });

    if (req.method === "GET") {
        const rows = await sql/*sql*/`
            SELECT  category_id, name, bg_color_hex, text_color_hex, ring_color_hex, create_at, update_at, position FROM service_categories 
            WHERE category_id = ${id}
            LiMIT 1
        `;
        if (rows.length === 0) return res.status(404).json({ ok: false, message: "Not found." });
        return res.status(200).json({ ok: true, category: rows[0] as CategoryRow });
    }

    if (req.method === "PATCH") {
        const p = req.body as CategoryUpdatePayload;

        await sql/*sql*/`BEGIN`;
        try {
            await sql/*sql*/`
                UPDATE service_categories
                SET name = COALESCE(${p.name ?? null}, name),
                    bg_color_hex = COALESCE(${p.bg_color_hex ?? null}, bg_color_hex),
                    text_color_hex = COALESCE(${p.text_color_hex ?? null}, text_color_hex),
                    ring_color_hex = COALESCE(${p.ring_color_hex ?? null}, ring_color_hex),
                    update_at = NOW()
                WHERE category_id = ${id}
            `;
            await sql/*sql*/`COMMIT`;
        } catch (e) {
            await sql/*sql*/`ROLLBACK`;
            const msg = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: msg });
        }

        const rows = (await sql/*sql*/`
            SELECT category_id, name, bg_color_hex, text_color_hex, ring_color_hex,
                    position, create_at, update_at
            FROM service_categories
            WHERE category_id = ${id}
            LIMIT 1
        `) as CategoryRow[];

        return res.status(200).json({ ok: true, category: rows[0] });
    }

    if (req.method === "DELETE") {
        await sql/*sql*/`DELETE FROM service_categories WHERE category_id = ${id}`;
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, message: "Method not allowed" });
}