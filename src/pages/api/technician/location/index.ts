import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

type MyReq = NextApiRequest & { admin: AdminJwt };

type GetLocationRow = {
    lat: number;
    lng: number;
    address_text: string;
    address_meta: unknown;
    updated_at: string;
};

async function q<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const { rows } = await query(sql, params as unknown[]);
    return rows as T[];
}

async function handler(req: MyReq, res: NextApiResponse) {
    const techId = Number((req.admin as { adminId: string | number }).adminId);
    if (!Number.isFinite(techId)) return res.status(401).json({ message: "invalid token" });

    if (req.method === "GET") {
        const sql = `
      SELECT lat, lng, address_text, address_meta, updated_at
      FROM technician_locations
      WHERE admin_id = $1
      LIMIT 1
    `;
        const rows = await q<GetLocationRow>(sql, [techId]);
        return res.json({ ok: true, location: rows[0] ?? null });
    }

    if (req.method === "POST") {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
        const { lat, lng, address_text, meta } = body as {
            lat: number; lng: number; address_text: string; meta?: unknown;
        };

        if (
            typeof lat !== "number" || Number.isNaN(lat) ||
            typeof lng !== "number" || Number.isNaN(lng) ||
            typeof address_text !== "string" || !address_text.trim()
        ) {
            return res.status(400).json({ ok: false, message: "invalid payload" });
        }

        const sql = `
            INSERT INTO technician_locations (admin_id, lat, lng, address_text, address_meta)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (admin_id)
            DO UPDATE SET lat = EXCLUDED.lat,
                            lng = EXCLUDED.lng,
                            address_text = EXCLUDED.address_text,
                            address_meta = EXCLUDED.address_meta,
                            updated_at = now()
            RETURNING lat, lng, address_text, address_meta, updated_at
        `;

        const rows = await q<GetLocationRow>(sql, [
            techId, lat, lng, address_text.trim(), meta ?? null
        ]);

        return res.json({ ok: true, location: rows[0] });
    }

    return res.status(405).end();
}

export default withAdminAuth<MyReq>(handler, ["technician", "admin", "manager", "superadmin"]);


//# GET/PUT สถานะ/พิกัดช่าง