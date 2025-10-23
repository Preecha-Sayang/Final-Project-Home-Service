import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";
import type { BookingNearby } from "@/types/booking";

// แปลง query param
function num(v: string | string[] | undefined): number | null {
    if (!v || Array.isArray(v)) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();

    const adminId = Number(req.admin.adminId);
    const lat = num(req.query.lat);
    const lng = num(req.query.lng);

    // ดึงจาก technician_locations
    let centerLat = lat;
    let centerLng = lng;

    if (centerLat == null || centerLng == null) {
        const loc = await query(
            `SELECT lat, lng
       FROM technician_locations
       WHERE admin_id = $1
       LIMIT 1`,
            [adminId]
        );
        if (loc.rows[0]) {
            centerLat = Number(loc.rows[0].lat);
            centerLng = Number(loc.rows[0].lng);
        }
    }

    // เลือกงานสถานะ "รอรับงาน" ที่ยังไม่มีคนรับ (inbox)
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
            WHERE b.status_id = 1 AND b.admin_id IS NULL
            LIMIT 200
        ),
        scored AS (
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
                WHEN $1::double precision IS NULL
                OR $2::double precision IS NULL
                OR lat IS NULL OR lng IS NULL
                THEN NULL
                ELSE 6371 * acos(
                cos(radians($1::double precision)) * cos(radians(lat)) *
                cos(radians(lng) - radians($2::double precision))
                + sin(radians($1::double precision)) * sin(radians(lat))
                )
            END AS distance_km
            FROM base
        )
        SELECT *
        FROM scored
        ORDER BY
            CASE
            WHEN $1::double precision IS NOT NULL AND $2::double precision IS NOT NULL
            THEN distance_km
            END NULLS LAST,
            booking_id DESC
        LIMIT 100;
    `;

    const { rows } = await query(sql, [centerLat, centerLng]);

    const jobs: BookingNearby[] = rows.map((r) => ({
        booking_id: Number(r.booking_id),
        order_code: String(r.order_code ?? ""),
        status_id: Number(r.status_id),
        service_date: r.service_date ? String(r.service_date) : null,
        service_time: r.service_time ? String(r.service_time) : null,
        address_text: r.address_text ? String(r.address_text) : null,
        lat: r.lat == null ? null : Number(r.lat),
        lng: r.lng == null ? null : Number(r.lng),
        distance_km: r.distance_km == null ? null : Number(r.distance_km),
    }));

    return res.json({
        ok: true,
        center: centerLat != null && centerLng != null ? { lat: centerLat, lng: centerLng } : null,
        jobs,
    });
}

export default withAdminAuth<AdminRequest>(handler, ["technician", "admin", "manager", "superadmin"]);
