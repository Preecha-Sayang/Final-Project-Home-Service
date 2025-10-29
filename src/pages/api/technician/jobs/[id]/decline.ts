import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, type AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";
import { BookingStatusId } from "@/types/booking";

function parseId(v: string | string[] | undefined): number | null {
    if (!v || Array.isArray(v)) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

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
        ip:
            (req.headers["x-forwarded-for"] as string | undefined)
                ?.split(",")[0]
                ?.trim() ||
            req.socket.remoteAddress ||
            undefined,
        ua: req.headers["user-agent"],
        reason: body.reason,
    };

    try {
        await query("BEGIN");

        const { rows } = await query(
            `SELECT booking_id, status_id, admin_id
             FROM booking
             WHERE booking_id = $1
             FOR UPDATE`,
            [bookingId]
        );

        const row =
            rows[0] as
            | { booking_id: number; status_id: number; admin_id: number | null }
            | undefined;

        if (!row) {
            await query("ROLLBACK");
            return res.status(404).json({ ok: false, message: "not found" });
        }

        // อนุญาตให้ปฏิเสธได้ 2 เงื่อนไข:
        const canDeclineWhenNotTaken =
            row.status_id === BookingStatusId.WaitingAccept && row.admin_id === null;
        const canDeclineWhenTakenBySelf =
            row.status_id === BookingStatusId.WaitingProcess && row.admin_id === adminId;

        if (!canDeclineWhenNotTaken && !canDeclineWhenTakenBySelf) {
            await query("ROLLBACK");
            return res.status(409).json({ ok: false, message: "cannot decline" });
        }

        // คืนสถานะให้กลับเป็น WaitingAccept และปลด admin ออก (ปลอดภัยทั้งสองกรณี)
        await query(
            `UPDATE booking
             SET admin_id = NULL,
                 status_id = $2,
                 update_at = now()
             WHERE booking_id = $1`,
            [bookingId, BookingStatusId.WaitingAccept]
        );

        await query(
            `INSERT INTO booking_actions 
             (booking_id, actor_admin_id, action, meta)
             VALUES ($1, $2, 'TECH_DECLINE', $3::jsonb)`,
            [bookingId, adminId, JSON.stringify(meta)]
        );

        await query("COMMIT");
        return res.json({ ok: true });
    } catch (err) {
        await query("ROLLBACK");
        console.error("DECLINE error:", err);
        return res.status(500).json({ ok: false, message: "server error" });
    }
}

export default withAdminAuth<AdminRequest>(
    handler,
    ["technician", "admin", "manager", "superadmin"]
);
