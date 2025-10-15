import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type { CategoryRow, CategoryListOk, CategoryErr, ReorderPayload } from "@/types/category";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CategoryListOk | CategoryErr>
) {

    if (req.method !== "PUT") {
        return res.status(405).json({ ok: false, message: "Method Not Allowed." });
    }

    const body = req.body as ReorderPayload;
    if (!Array.isArray(body?.ids) || body.ids.length === 0) {
        return res.status(400).json({ ok: false, message: "ids required." });
    }

    try {
        await sql/*sql*/`BEGIN`;
        for (let i = 0; i < body.ids.length; i += 1) {
            await sql/*sql*/`
                UPDATE service_categories SET position = ${i + 1}
                WHERE category_id = ${body.ids[i]}
            `;
        }
        await sql/*sql*/`COMMIT`;

        const rows = await sql/*sql*/`
            SELECT category_id, name,
                    bg_color_hex, text_color_hex, ring_color_hex,
                    position, create_at, update_at
            FROM service_categories
            ORDER BY position ASC, category_id ASC
        ` as CategoryRow[];

        return res.status(200).json({ ok: true, categories: rows });
    } catch (e) {
        await sql/*sql*/`ROLLBACK`;
        const msg = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: msg });
    }
}