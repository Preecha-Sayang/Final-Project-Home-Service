import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

type ItemIn = { id: number; position?: number; index?: number };
type Ok = { ok: true; updated: number };
type Err = { ok: false; message: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Ok | Err>
) {
    if (req.method !== "PATCH") {
        return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const body = req.body as { items?: ItemIn[] } | undefined;
    if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
        return res.status(400).json({ ok: false, message: "items required" });
    }

    // ทำให้ทนทานกับทั้ง position และ index
    const rows = body.items
        .map((it) => {
            const id = Number((it as ItemIn).id);
            // index เริ่มจาก 1 (ฝั่ง UI map มาเป็น index อยู่แล้ว)
            const posRaw =
                (it as ItemIn).position ?? (it as ItemIn).index ?? Number.NaN;
            const position = Number(posRaw);
            if (!Number.isFinite(id) || !Number.isFinite(position)) return null;
            return { id, position };
        })
        .filter((x): x is { id: number; position: number } => x !== null);

    if (rows.length === 0) {
        return res.status(400).json({ ok: false, message: "invalid items" });
    }

    // อัปเดตแบบชุดเดียว
    const valuesSql = rows.map((r) => `(${r.id}, ${r.position})`).join(", ");

    try {
        const result = await sql/*sql*/`
            WITH vals(id, position) AS (
                VALUES ${sql.unsafe(valuesSql)}
            )
            UPDATE services s
            SET position = v.position
            FROM vals v
            WHERE s.service_id = v.id
            RETURNING s.service_id
        `;

        return res.status(200).json({ ok: true, updated: result.length });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message });
    }
}
