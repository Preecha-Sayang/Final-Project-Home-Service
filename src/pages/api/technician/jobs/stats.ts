import type { NextApiResponse } from "next";
import { withAdminAuth, AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();

    const adminId = Number(req.admin.adminId);

    const { rows } = await query(
        `SELECT status_id, COUNT(*)::int AS count
     FROM booking
     WHERE (admin_id = $1 AND status_id IN (2,3,4,5)) OR (status_id = 1 AND admin_id IS NULL)
     GROUP BY status_id`,
        [adminId]
    );

    const stats: Record<number, number> = {};
    for (const r of rows) stats[Number(r.status_id)] = Number(r.count);

    return res.json({ ok: true, stats });
}

export default withAdminAuth<AdminRequest>(handler, ["technician", "admin", "manager", "superadmin"]);
