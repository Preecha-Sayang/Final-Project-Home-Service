import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, type AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";

/** ดึงเลข booking_id จาก URL */
function parseId(v: string | string[] | undefined): number | null {
    if (!v || Array.isArray(v)) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/** meta ที่บันทึกลง booking_actions */
type ActionMeta = {
    ip?: string;
    ua?: string;
    reason?: string;
};

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const bookingId = parseId((req.query as NextApiRequest["query"]).id);
    if (bookingId == null) {
        return res.status(400).json({ ok: false, message: "invalid id" });
    }

    const adminId = Number(req.admin.adminId);
    const body = (req.body ?? {}) as { reason?: string };
    const meta: ActionMeta = {
        ip: (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || req.socket.remoteAddress || undefined,
        ua: req.headers["user-agent"],
        reason: body.reason,
    };

    // แค่บันทึก log การปฏิเสธ ไม่เปลี่ยนสถานะ/เจ้าของงาน
    try {
        await query(
            `INSERT INTO booking_actions (booking_id, actor_admin_id, action, meta)
       VALUES ($1, $2, 'decline', $3::jsonb)`,
            [bookingId, adminId, JSON.stringify(meta)]
        );
        return res.json({ ok: true });
    } catch {
        return res.status(500).json({ ok: false, message: "server error" });
    }
}

export default withAdminAuth<AdminRequest>(handler, ["technician", "admin", "manager", "superadmin"]);
