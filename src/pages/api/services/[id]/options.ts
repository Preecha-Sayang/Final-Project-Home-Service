import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

type OptRow = {
    service_option_id: number;
    service_id: number;
    name: string;
    unit: string;
    unit_price: string;
};

type Ok = { ok: true; options: OptRow[] };
type Err = { ok: false; message?: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Ok | Err>
) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) {
        return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    // ดึงรายการย่อยตาม service_id
    if (req.method === "GET") {
        const rowsAny = await sql/*sql*/`
            SELECT service_option_id, service_id, name, unit, unit_price
            FROM service_option
            WHERE service_id = ${id}
            ORDER BY service_option_id ASC
        `;
        const rows = rowsAny as unknown as OptRow[];
        return res.status(200).json({ ok: true, options: rows });
    }

    // (เพิ่ม/แก้ไขเป็นชุด)
    if (req.method === "POST") {
        try {
            const body = req.body as {
                options?: Array<{
                    service_option_id?: number;
                    name: string;
                    unit: string;
                    unit_price: number | string;
                }>;
            };

            if (!body?.options || !Array.isArray(body.options)) {
                return res.status(400).json({ ok: false, message: "options required" });
            }

            await sql/*sql*/`BEGIN`;

            for (const opt of body.options) {
                const priceNum = Number(opt.unit_price);
                if (!opt.name?.trim() || !opt.unit?.trim() || Number.isNaN(priceNum)) {
                    throw new Error("Invalid option row");
                }

                if (opt.service_option_id) {
                    // update
                    await sql/*sql*/`
                        UPDATE service_option
                        SET name = ${opt.name.trim()},
                            unit = ${opt.unit.trim()},
                            unit_price = ${priceNum}
                        WHERE service_option_id = ${opt.service_option_id}
                        AND service_id = ${id}
                    `;
                } else {
                    // insert
                    await sql/*sql*/`
                        INSERT INTO service_option (service_id, name, unit, unit_price)
                        VALUES (${id}, ${opt.name.trim()}, ${opt.unit.trim()}, ${priceNum})
                    `;
                }
            }

            await sql/*sql*/`COMMIT`;

            // ส่งรายการล่าสุดกลับ
            const rowsAny = await sql/*sql*/`
                SELECT service_option_id, service_id, name, unit, unit_price
                FROM service_option
                WHERE service_id = ${id}
                ORDER BY service_option_id ASC
            `;
            const rows = rowsAny as unknown as OptRow[];

            return res.status(200).json({ ok: true, options: rows });
        } catch (e) {
            await sql/*sql*/`ROLLBACK`;
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message });
        }
    }

    return res.status(405).end();
}