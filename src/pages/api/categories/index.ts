import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type {
    CategoryRow,
    CategoryListOk,
    CategoryErr,
    CategoryCreatePayload,
} from "@/types/category";

type CreateOk = { ok: true; category: CategoryRow };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CategoryListOk | CreateOk | CategoryErr>
) {
    try {
        if (req.method === "GET") {
            const rows = await sql/*sql*/`
                SELECT category_id, name,
                    bg_color_hex, text_color_hex, ring_color_hex,
                    position,
                    create_at, update_at
                FROM service_categories
                ORDER BY position ASC, category_id ASC
            ` as CategoryRow[];

            return res.status(200).json({ ok: true, categories: rows });
        }

        if (req.method === "POST") {
            // create
            const body = req.body as CategoryCreatePayload;
            if (
                !body?.name?.trim() ||
                !body?.bg_color_hex ||
                !body?.text_color_hex ||
                !body?.ring_color_hex
            ) {
                return res.status(400).json({
                    ok: false,
                    message: "invalid payload.",
                });
            }

            // หาตำแหน่งถัดไป
            const [{ maxpos }] = await sql/*sql*/`
                SELECT COALESCE(MAX(position), 0) AS maxpos 
                FROM service_categories
            ` as Array<{ maxpos: number }>;

            const nextPos = (Number(maxpos) || 0) + 1;

            // คืนค่า category_id
            const [created] = await sql/*sql*/`
                INSERT INTO service_categories
                    (name, bg_color_hex, text_color_hex, ring_color_hex, position)
                VALUES
                    (${body.name.trim()}, 
                    ${body.bg_color_hex}, ${body.text_color_hex}, ${body.ring_color_hex}, 
                    ${nextPos})
                RETURNING
                    category_id, name,
                    bg_color_hex, text_color_hex, ring_color_hex,
                    position, create_at, update_at
            ` as CategoryRow[];

            return res.status(200).json({
                ok: true,
                category: created,
            });
        }

        return res.status(405).json({ ok: false, message: "Method Not Allowed" });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: msg });
    }
}