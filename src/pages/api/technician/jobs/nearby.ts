import type { NextApiResponse } from "next";
import { withAdminAuth, AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";
import type { BookingNearby, AddressMeta } from "@/types/booking";

function num(v: string | string[] | undefined): number | null {
    if (!v || Array.isArray(v)) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

type Row = {
    booking_id: number;
    order_code: string;
    status_id: number;
    service_date: string | null;
    service_time: string | null;
    address_text: string | null;
    address_meta: AddressMeta | null;
    lat: number | null;
    lng: number | null;
    total_price: number | null;
    item_names: string[] | null;
    service_titles: string[] | null;
    sub_items: {
        service_option_id: number;
        name: string;
        quantity: number;
        unit: string | null;
        unit_price: number | null;
        subtotal_price: number | null;
    }[] | null;
    distance_km: number | null;
};

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();

    const adminId = Number(req.admin.adminId);
    const lat = num(req.query.lat);
    const lng = num(req.query.lng);
    const radiusKm = 5;

    // fallback center = last technician location if FE didn't send lat/lng
    const locRes = await query(
        `SELECT lat, lng FROM technician_locations WHERE admin_id = $1 LIMIT 1`,
        [adminId]
    );
    const loc = (locRes.rows?.[0] ?? {}) as { lat?: number; lng?: number };

    const centerLat = lat ?? loc.lat ?? null;
    const centerLng = lng ?? loc.lng ?? null;

    // lock parameter types up-front (clat/clng/radius) to avoid "could not determine data type" errors
    const sql = `
    WITH params AS (
      SELECT
        CAST($1 AS double precision) AS clat,
        CAST($2 AS double precision) AS clng,
        CAST($3 AS double precision) AS radius
    ),
    base AS (
      SELECT
        b.booking_id,
        b.order_code,
        b.status_id,
        b.service_date,
        b.service_time,
        b.total_price,
        b.address_data AS address_meta,
        COALESCE(
          NULLIF((b.address_data->>'text')::text, ''),
          CONCAT_WS(' ',
            COALESCE(b.address_data->>'address',''),
            COALESCE(b.address_data->>'subdistrict',''),
            COALESCE(b.address_data->>'district',''),
            COALESCE(b.address_data->>'province','')
          )
        ) AS address_text,
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
            array_agg(so.name ORDER BY bi.id)            AS item_names,
            array_agg(DISTINCT s.servicename)            AS service_titles,
            json_agg(
            json_build_object(
                'service_option_id', so.service_option_id,
                'name',             so.name,
                'quantity',         bi.quantity,
                'unit',             so.unit,
                'unit_price',       so.unit_price,
                'subtotal_price',   bi.subtotal_price
            )
            ORDER BY bi.id
            ) AS sub_items
        FROM booking_item bi
        JOIN service_option so ON so.service_option_id = bi.service_option_id
        JOIN services       s  ON s.service_id        = so.service_id
        GROUP BY bi.booking_id
        )
    SELECT *
    FROM (
      SELECT
        base.booking_id,
        base.order_code,
        base.status_id,
        base.service_date,
        base.service_time,
        base.address_text,
        base.address_meta,
        base.lat,
        base.lng,
        base.total_price,
        items.item_names,
        items.service_titles,
        items.sub_items,
        CASE
          WHEN (SELECT clat  FROM params) IS NULL
            OR (SELECT clng FROM params) IS NULL
            OR base.lat IS NULL OR base.lng IS NULL
          THEN NULL
          ELSE 6371 * acos(
            GREATEST(-1, LEAST(1,
              cos(radians((SELECT clat  FROM params))) *
              cos(radians(base.lat)) *
              cos(radians(base.lng) - radians((SELECT clng FROM params))) +
              sin(radians((SELECT clat FROM params))) *
              sin(radians(base.lat))
            ))
          )
        END AS distance_km
      FROM base
      LEFT JOIN items ON items.booking_id = base.booking_id
      WHERE (
        (SELECT clat FROM params) IS NULL
        OR (SELECT clng FROM params) IS NULL
        OR base.lat IS NULL OR base.lng IS NULL
        OR (
          6371 * acos(
            GREATEST(-1, LEAST(1,
              cos(radians((SELECT clat  FROM params))) *
              cos(radians(base.lat)) *
              cos(radians(base.lng) - radians((SELECT clng FROM params))) +
              sin(radians((SELECT clat FROM params))) *
              sin(radians(base.lat))
            ))
          )
        ) <= (SELECT radius FROM params)
      )
    ) t
    ORDER BY
      CASE
        WHEN (SELECT clat FROM params) IS NOT NULL
         AND (SELECT clng FROM params) IS NOT NULL
        THEN t.distance_km
      END NULLS LAST,
      t.booking_id DESC
    LIMIT 100;
  `;

    try {
        const rows = (await query(sql, [centerLat, centerLng, radiusKm])).rows as Row[];

        const jobs: BookingNearby[] = rows.map((r) => ({
            booking_id: r.booking_id,
            order_code: r.order_code ?? "",
            status_id: r.status_id,
            service_date: r.service_date ?? null,
            service_time: r.service_time ?? null,
            address_text: r.address_text ?? null,
            address_meta: r.address_meta ?? null,
            lat: r.lat ?? null,
            lng: r.lng ?? null,
            distance_km: r.distance_km ?? null,
            total_price: r.total_price ?? null,
            item_names: r.item_names ?? [],
            service_titles: r.service_titles ?? [],
            sub_items: r.sub_items ?? [],
        }));

        res.json({
            ok: true,
            center: centerLat != null && centerLng != null ? { lat: centerLat, lng: centerLng } : null,
            jobs,
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "server error";
        console.error("SQL error:", message);
        res.status(500).json({ ok: false, message });
    }
}

export default withAdminAuth<AdminRequest>(handler, [
    "technician",
    "admin",
    "manager",
    "superadmin",
]);
