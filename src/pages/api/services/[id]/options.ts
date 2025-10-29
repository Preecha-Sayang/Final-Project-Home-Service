import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

type OptRow = {
    service_option_id: number;
    service_id: number;
    name: string;
    unit: string;
    unit_price: string;
    position: number;
};

type Ok = { ok: true; options: OptRow[] };
type Err = { ok: false; message?: string };

type UpsertPayloadRow = {
    service_option_id?: number;
    name: string;
    unit: string;
    unit_price: number | string;
    position: number;
};

type UpsertPayload = { options?: UpsertPayloadRow[] };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Ok | Err>
) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) {
        return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    // ดึงรายการย่อยเรียงตาม position
    if (req.method === "GET") {
        const rowsU = await sql/*sql*/`
            SELECT service_option_id, service_id, name, unit, unit_price, position
            FROM service_option
            WHERE service_id = ${id}
            ORDER BY position ASC, service_option_id ASC
        `;
        const rows = rowsU as unknown as OptRow[];
        return res.status(200).json({ ok: true, options: rows });
    }

    // (เพิ่ม/แก้ไขเป็นชุด)
    if (req.method === "POST") {
        try {
            const body: UpsertPayload = req.body;
            if (!body?.options || !Array.isArray(body.options)) {
                return res.status(400).json({ ok: false, message: "options required" });
            }

            await sql/*sql*/`BEGIN`;

            for (const opt of body.options) {
                const priceNum = Number(opt.unit_price);
                if (!opt.name?.trim() || !opt.unit?.trim() || Number.isNaN(priceNum)) {
                    throw new Error("Invalid option row.");
                }
                if (!Number.isInteger(opt.position) || opt.position < 1) {
                    throw new Error("Invalid position.");
                }

                if (opt.service_option_id) {
                    // update
                    await sql/*sql*/`
                        UPDATE service_option
                        SET name = ${opt.name.trim()},
                            unit = ${opt.unit.trim()},
                            unit_price = ${priceNum},
                            position = ${opt.position}
                        WHERE service_option_id = ${opt.service_option_id}
                            AND service_id = ${id}
                    `;
                } else {
                    // insert
                    await sql/*sql*/`
                        INSERT INTO service_option (service_id, name, unit, unit_price, position)
                        VALUES (${id}, ${opt.name.trim()}, ${opt.unit.trim()}, ${priceNum}, ${opt.position})
                    `;
                }
            }

            // จัดลำดับให้เรียงตาม position
            await sql/*sql*/`
                WITH t AS (
                    SELECT service_option_id,
                        ROW_NUMBER() OVER (PARTITION BY service_id ORDER BY position, service_option_id) AS rn
                    FROM service_option
                    WHERE service_id = ${id}
                )
                UPDATE service_option s
                SET position = t.rn
                FROM t
                WHERE s.service_option_id = t.service_option_id
                    AND s.service_id = ${id}
            `;

            await sql/*sql*/`COMMIT`;

            // ส่งรายการล่าสุดกลับ
            const rowsU2 = await sql/*sql*/`
                SELECT service_option_id, service_id, name, unit, unit_price, position
                FROM service_option
                WHERE service_id = ${id}
                ORDER BY position ASC, service_option_id ASC
            `;
            const rows2 = rowsU2 as unknown as OptRow[];
            return res.status(200).json({ ok: true, options: rows2 });
        } catch (e) {
            await sql/*sql*/`ROLLBACK`;
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message });
        }
    }

    return res.status(405).end();
}
