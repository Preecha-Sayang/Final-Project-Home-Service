import type { NextApiResponse } from "next";
import { withAdminAuth, AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";
import type { BookingNearby } from "@/types/booking";

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
    const radiusKm = 5;

    // ตำแหน่งล่าสุดของช่าง (กรณีไม่ได้ส่ง lat/lng มาจาก FE)
    const locRes = await query(
        `SELECT lat, lng FROM technician_locations WHERE admin_id = $1 LIMIT 1`,
        [adminId]
    );
    const loc = (locRes.rows?.[0] ?? {}) as { lat?: number; lng?: number };

    const centerLat = lat ?? loc.lat ?? null;
    const centerLng = lng ?? loc.lng ?? null;

    const sql = `
    WITH base AS (
      SELECT
        b.booking_id,
        b.order_code,
        b.status_id,
        b.service_date,
        b.service_time,
        b.total_price,
        COALESCE((b.address_data->>'text')::text, '') AS address_text,
        COALESCE((b.address_data->>'lat')::double precision, NULL) AS lat,
        COALESCE((b.address_data->>'lng')::double precision, NULL) AS lng
      FROM booking b
      WHERE b.status_id = 1
        AND b.admin_id IS NULL
      ORDER BY b.booking_id DESC
      LIMIT 200
    ),
    items AS (
      SELECT
        bi.booking_id,
        array_agg(so.name ORDER BY bi.service_option_id) AS item_names
      FROM booking_item bi
      JOIN service_option so ON so.service_option_id = bi.service_option_id
      GROUP BY bi.booking_id
    ),
    distances AS (
      SELECT
        base.*,
        items.item_names,
        CASE
          WHEN $1::double precision IS NULL
            OR $2::double precision IS NULL
            OR base.lat IS NULL
            OR base.lng IS NULL
          THEN NULL
          ELSE 6371 * acos(
            cos(radians($1::double precision)) * cos(radians(base.lat)) *
            cos(radians(base.lng) - radians($2::double precision)) +
            sin(radians($1::double precision)) * sin(radians(base.lat))
          )
        END AS distance_km
      FROM base
      LEFT JOIN items ON items.booking_id = base.booking_id
    )
    SELECT *
    FROM (
      SELECT * FROM distances
      WHERE
        (
          $1::double precision IS NULL OR
          $2::double precision IS NULL OR
          lat IS NULL OR lng IS NULL OR
          distance_km <= $3::double precision
        )
    ) AS filtered
    ORDER BY
      (CASE WHEN $1::double precision IS NOT NULL AND $2::double precision IS NOT NULL
        THEN filtered.distance_km END) NULLS LAST,
      filtered.booking_id DESC
    LIMIT 100;
  `;

    try {
        const result = await query(sql, [centerLat, centerLng, radiusKm]);
        const rows = result.rows as {
            booking_id: number;
            order_code: string;
            status_id: number;
            service_date: string | null;
            service_time: string | null;
            address_text: string | null;
            lat: number | null;
            lng: number | null;
            total_price: number | null;
            item_names: string[] | null;
            distance_km: number | null;
        }[];

        const jobs: BookingNearby[] = rows.map((r) => ({
            booking_id: r.booking_id,
            order_code: r.order_code ?? "",
            status_id: r.status_id,
            service_date: r.service_date ?? null,
            service_time: r.service_time ?? null,
            address_text: r.address_text ?? null,
            lat: r.lat ?? null,
            lng: r.lng ?? null,
            distance_km: r.distance_km ?? null,
            total_price: r.total_price ?? null,
            item_names: r.item_names ?? [],
        }));

        res.json({
            ok: true,
            center: centerLat != null && centerLng != null ? { lat: centerLat, lng: centerLng } : null,
            jobs,
        });
    } catch (e: any) {
        console.error("SQL error:", e?.message || e);
        res.status(500).json({ ok: false, message: e?.message || "server error" });
    }
}

export default withAdminAuth<AdminRequest>(
    handler,
    ["technician", "admin", "manager", "superadmin"]
);
