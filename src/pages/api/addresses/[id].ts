import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid id" });


    try {
        if (req.method === "GET") {
            const rows = await sql/*sql*/`SELECT * FROM addresses WHERE address_id = ${id} LIMIT 1` as Array<
                { address_id: number } & Record<string, unknown>
            >;
            if (rows.length === 0) return res.status(404).json({ ok: false, message: "Not found" });
            return res.status(200).json({ ok: true, item: rows[0] });
        }


        if (req.method === "PUT") {
            const body = JSON.parse(req.body ?? "{}") as Record<string, unknown>;
            const keys = [
                "user_id", "label", "place_name", "address_line1", "address_line2",
                "district", "city", "province", "postal_code", "country", "lat", "lng",
            ] as const;
            type UpdatableKey = typeof keys[number];

            const fields = keys.filter((k) => k in body) as UpdatableKey[];
            if (fields.length === 0) return res.status(400).json({ ok: false, message: "No fields" });


            const sets = fields.map((k, i) => `${k} = $${i + 1}`).join(", ");
            const values = fields.map((k) => body[k]);

            const queryText = `UPDATE addresses SET ${sets} WHERE address_id = $${fields.length + 1} RETURNING *`;

            // เรียกใช้ sql แบบฟังก์ชันด้วยการ cast เป็น signature ที่ยอมรับได้ (เลี่ยง any)
            const execSql = sql as unknown as (q: string, params: unknown[]) => Promise<
                Array<{ address_id: number } & Record<string, unknown>>
            >;

            const rows = await execSql(queryText, [...values, id]);
            return res.status(200).json({ ok: true, item: rows[0] });
        }


        if (req.method === "DELETE") {
            await sql/*sql*/`DELETE FROM addresses WHERE address_id = ${id}`;
            return res.status(200).json({ ok: true });
        }


        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ ok: false, message: "Method Not Allowed" });
    } catch (err: unknown) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Server error" });
    }
}

//# GET/PUT/DELETE
