import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

type MyReq = NextApiRequest & { admin: AdminJwt };

async function q<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const { rows } = await query(sql, params as unknown[]);
    return rows as T[];
}

async function handler(req: MyReq, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    // ดึง technician id จาก token
    const techId = (req.admin as unknown as { adminId: number }).adminId;

    const id = Number(req.query.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ ok: false, message: "invalid id" });
    }

    // รับงานได้ก็ต่อเมื่อ status = 1 และยังไม่มี admin_id
    const sql = `
        UPDATE booking
        SET admin_id = $1,
            status_id = 2,
            update_at = now()
        WHERE booking_id = $2
        AND admin_id IS NULL
        AND status_id = 1
        RETURNING booking_id
    `;

    const rows = await q<{ booking_id: number }>(sql, [techId, id]);
    if (rows.length === 0) {
        return res.status(409).json({ ok: false, message: "มีผู้รับงานไปแล้ว หรือสถานะไม่อนุญาต" });
    }

    return res.json({ ok: true, booking_id: rows[0].booking_id });
}

export default withAdminAuth<MyReq>(handler, ["technician"]);
