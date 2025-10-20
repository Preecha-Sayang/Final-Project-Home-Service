import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

type MyReq = NextApiRequest & { admin: AdminJwt };
type Body = { next: "enroute" | "working" | "done" | "cancel" };

async function q<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const { rows } = await query(sql, params as unknown[]);
    return rows as T[];
}

function nextToStatusId(next: Body["next"]): number {
    switch (next) {
        case "enroute": // ไปหน้างาน / ระหว่างทาง
        case "working": // กำลังดำเนินงาน
            return 3;
        case "done":
            return 4;
        case "cancel":
            return 5;
    }
    // ป้องกัน type
    const _exhaustive: never = next;
    return _exhaustive;
}

async function handler(req: MyReq, res: NextApiResponse) {
    if (req.method !== "PATCH") return res.status(405).end();

    const techId = req.admin.adminId;
    const id = Number(req.query.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ ok: false, message: "invalid id" });
    }

    const { next } = req.body as Body;
    const statusId = nextToStatusId(next);

    // จำกัดสิทธิ์
    const sql = `
        UPDATE booking
        SET status_id = $1,
            update_at = now()
        WHERE booking_id = $2
        AND admin_id = $3
        AND status_id IN (2,3)
        RETURNING booking_id, status_id
    `;

    const rows = await q<{ booking_id: number; status_id: number }>(sql, [statusId, id, techId]);
    if (rows.length === 0) {
        return res.status(403).json({ ok: false, message: "ไม่มีสิทธิ์ หรือสถานะไม่ถูกต้อง" });
    }

    return res.json({ ok: true, booking_id: rows[0].booking_id, status_id: rows[0].status_id });
}

export default withAdminAuth<MyReq>(handler, ["technician"]);
