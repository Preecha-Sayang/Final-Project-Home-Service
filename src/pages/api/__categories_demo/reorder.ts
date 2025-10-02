import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type { ReorderPayload } from "@/types/__category";

type Ok = { ok: true };
type Err = { ok: false; message?: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Ok | Err>
) {
    if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

    const { ids } = req.body as ReorderPayload;
    if (!Array.isArray(ids)) return res.status(400).json({ ok: false, message: "ids required" });

    await sql/*sql*/`BEGIN`;
    try {
        for (let i = 0; i < ids.length; i += 1) {
            const id = Number(ids[i]);
            if (!id || Number.isNaN(id)) continue;
            await sql/*sql*/`
                UPDATE service_categories
                SET position = ${i + 1}, update_at = NOW()
                WHERE category_id = ${id}
            `;
        }
        await sql/*sql*/`COMMIT`;
        return res.status(200).json({ ok: true });
    } catch (e) {
        await sql/*sql*/`ROLLBACK`;
        const msg = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: msg });
    }
}
