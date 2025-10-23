import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";
import type { JobListItem } from "@/types/booking";

// parse helpers
function toNum(v: string | string[] | undefined): number | null {
    if (!v || Array.isArray(v)) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}
function toStr(v: string | string[] | undefined): string | null {
    if (!v || Array.isArray(v)) return null;
    const s = v.trim();
    return s.length ? s : null;
}

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();

    const mode = (toStr(req.query.mode) ?? "inbox") === "mine" ? "mine" : "inbox";
    const q = toStr(req.query.q);
    const limit = toNum(req.query.limit) ?? 30;

    const lat = toNum(req.query.lat);
    const lng = toNum(req.query.lng);
    const radiusKm = toNum(req.query.radiusKm); // optional

    const adminId = Number(req.admin.adminId);

    // SQL with Haversine (no PostGIS)
    const sql = `
        WITH base AS (
            SELECT
            b.booking_id,
            b.order_code,
            b.status_id,
            b.service_date,
            b.service_time,
            COALESCE((b.address_data->>'lat')::double precision, NULL) AS lat,
            COALESCE((b.address_data->>'lng')::double precision, NULL) AS lng,
            COALESCE((b.address_data->>'text')::text, '') AS address_text
            FROM booking b
            WHERE
            ($1 = 'inbox' AND b.status_id = 1 AND b.admin_id IS NULL)
            OR
            ($1 = 'mine'  AND b.admin_id = $2 AND b.status_id IN (2,3))
        )
        SELECT
            booking_id,
            order_code,
            status_id,
            service_date,
            service_time,
            address_text,
            lat,
            lng,
            CASE
            WHEN $3 IS NULL OR $4 IS NULL OR lat IS NULL OR lng IS NULL THEN NULL
            ELSE 6371 * acos(
                cos(radians($3)) * cos(radians(lat)) * cos(radians(lng) - radians($4))
                + sin(radians($3)) * sin(radians(lat))
            )
            END AS distance_km
        FROM base
        WHERE ($5 IS NULL OR address_text ILIKE '%'||$5||'%' OR order_code ILIKE '%'||$5||'%')
        AND (
            $6 IS NULL
            OR
            (
            $3 IS NOT NULL AND $4 IS NOT NULL
            AND 6371 * acos(
                cos(radians($3)) * cos(radians(lat)) * cos(radians(lng) - radians($4))
                + sin(radians($3)) * sin(radians(lat))
            ) <= $6
            )
        )
        ORDER BY
            CASE WHEN $3 IS NOT NULL AND $4 IS NOT NULL THEN distance_km END NULLS LAST,
            booking_id DESC
        LIMIT $7;
        `;

    const { rows } = await query(sql, [
        mode,
        adminId,
        lat,
        lng,
        q,
        radiusKm,
        limit,
    ]);

    // map > JobListItem
    const items: JobListItem[] = rows.map(r => ({
        booking_id: r.booking_id as number,
        title: String(r.order_code ?? "งาน"),
        address_text: String(r.address_text ?? ""),
        lat: r.lat === null ? null : Number(r.lat),
        lng: r.lng === null ? null : Number(r.lng),
        distance_km: r.distance_km === null ? null : Number(r.distance_km),
        status_id: Number(r.status_id),
        service_date: r.service_date ? String(r.service_date) : null,
        service_time: r.service_time ? String(r.service_time) : null,
        order_code: String(r.order_code ?? ""),
    }));

    return res.json({ ok: true, items });
}

export default withAdminAuth<AdminRequest>(handler, ["technician", "admin", "manager", "superadmin"]);
