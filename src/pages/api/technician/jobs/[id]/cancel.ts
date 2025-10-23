import type { NextApiResponse } from "next";
import { withAdminAuth, AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";
import { BookingStatusId } from "@/types/booking";

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();
    const bookingId = Number(req.query.id);
    if (!Number.isInteger(bookingId)) return res.status(400).json({ ok: false, message: "bad id" });

    const adminId = Number(req.admin.adminId);
    const { reason } = (req.body ?? {}) as { reason?: string };

    try {
        await query("BEGIN");
        const { rows } = await query(
            "SELECT booking_id, status_id, admin_id FROM booking WHERE booking_id = $1 FOR UPDATE",
            [bookingId]
        );
        const row = rows[0] as { booking_id: number; status_id: number; admin_id: number | null } | undefined;
        if (!row) { await query("ROLLBACK"); return res.status(404).json({ ok: false, message: "not found" }); }
        if (![BookingStatusId.WaitingProcess, BookingStatusId.InProgress].includes(row.status_id) || row.admin_id !== adminId) {
            await query("ROLLBACK"); return res.status(409).json({ ok: false, message: "cannot cancel" });
        }

        await query(
            "UPDATE booking SET status_id = $2, update_at = now() WHERE booking_id = $1",
            [bookingId, BookingStatusId.Canceled]
        );
        await query(
            "INSERT INTO booking_actions (booking_id, actor_admin_id, action, meta) VALUES ($1,$2,'TECH_CANCEL',$3::jsonb)",
            [bookingId, adminId, JSON.stringify({ reason: reason ?? null })]
        );
        await query("COMMIT");
        return res.json({ ok: true });
    } catch {
        await query("ROLLBACK");
        return res.status(500).json({ ok: false, message: "server error" });
    }
}

export default withAdminAuth<AdminRequest>(handler, ["technician", "admin", "manager", "superadmin"]);
