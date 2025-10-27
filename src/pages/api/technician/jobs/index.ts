import type { NextApiResponse } from "next";
import { withAdminAuth, type AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";
import type { JobListItem } from "@/types/booking";

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

    const q = toStr(req.query.q);
    const limit = toNum(req.query.limit) ?? 30;

    const lat = toNum(req.query.lat);
    const lng = toNum(req.query.lng);
    const radiusKm = toNum(req.query.radiusKm);

    const adminId = Number(req.admin.adminId);

    const sql = `
WITH tech AS (
  SELECT COALESCE(service_ids, '[]'::jsonb) AS service_ids
  FROM technician_profiles
  WHERE admin_id = $1
  LIMIT 1
),
base AS (
  SELECT
    b.booking_id,
    b.order_code,
    b.status_id,
    b.service_date,
    b.service_time,
    b.total_price,
    COALESCE((b.address_data->>'lat')::double precision, NULL) AS lat,
    COALESCE((b.address_data->>'lng')::double precision, NULL) AS lng,
    COALESCE((b.address_data->>'text')::text, '') AS address_text,
    (
      SELECT MIN(s.servicename)
      FROM booking_item bi
      JOIN service_option so ON so.service_option_id = bi.service_option_id
      JOIN services s        ON s.service_id        = so.service_id
      WHERE bi.booking_id = b.booking_id
        AND (SELECT service_ids FROM tech) @> to_jsonb(ARRAY[s.service_id])
    ) AS service_name
  FROM booking b
  WHERE b.admin_id = $1
    AND b.status_id IN (2,3)
    AND EXISTS (
      SELECT 1
      FROM booking_item bi2
      JOIN service_option so2 ON so2.service_option_id = bi2.service_option_id
      WHERE bi2.booking_id = b.booking_id
        AND (SELECT service_ids FROM tech) @> to_jsonb(ARRAY[so2.service_id])
    )
)
SELECT
  booking_id,
  order_code,
  status_id,
  service_date,
  service_time,
  address_text,
  lat, lng,
  total_price,
  service_name,
  CASE
    WHEN ($2::double precision) IS NULL
      OR ($3::double precision) IS NULL
      OR lat IS NULL OR lng IS NULL
    THEN NULL
    ELSE 6371 * acos(
      cos(radians($2::double precision)) * cos(radians(lat)) *
      cos(radians(lng) - radians($3::double precision)) +
      sin(radians($2::double precision)) * sin(radians(lat))
    )
  END AS distance_km
FROM base
WHERE
  (
    COALESCE($4::text, '') = ''
    OR address_text ILIKE '%' || $4::text || '%'
    OR order_code  ILIKE '%' || $4::text || '%'
    OR COALESCE(service_name,'') ILIKE '%' || $4::text || '%'
  )
  AND (
    ($5::double precision) IS NULL OR (
      ($2::double precision) IS NOT NULL AND ($3::double precision) IS NOT NULL AND
      6371 * acos(
        cos(radians($2::double precision)) * cos(radians(lat)) *
        cos(radians(lng) - radians($3::double precision)) +
        sin(radians($2::double precision)) * sin(radians(lat))
      ) <= ($5::double precision)
    )
  )
ORDER BY
  CASE
    WHEN ($2::double precision) IS NOT NULL AND ($3::double precision) IS NOT NULL THEN
      6371 * acos(
        cos(radians($2::double precision)) * cos(radians(lat)) *
        cos(radians(lng) - radians($3::double precision)) +
        sin(radians($2::double precision)) * sin(radians(lat))
      )
    ELSE NULL
  END NULLS LAST,
  booking_id DESC
LIMIT $6::int;
`;

    try {
        const { rows } = await query(sql, [
            adminId,  // $1
            lat,      // $2
            lng,      // $3
            q,        // $4
            radiusKm, // $5
            limit,    // $6
        ]);

        const items: (JobListItem & { service_name?: string | null; total_price?: number | null })[] =
            rows.map((r: any) => ({
                booking_id: Number(r.booking_id),
                title: String(r.service_name ?? r.order_code ?? "งาน"),
                address_text: String(r.address_text ?? ""),
                lat: r.lat === null ? null : Number(r.lat),
                lng: r.lng === null ? null : Number(r.lng),
                distance_km: r.distance_km === null ? null : Number(r.distance_km),
                status_id: Number(r.status_id),
                service_date: r.service_date ? String(r.service_date) : null,
                service_time: r.service_time ? String(r.service_time) : null,
                order_code: String(r.order_code ?? ""),
                service_name: r.service_name ?? null,
                total_price: r.total_price == null ? null : Number(r.total_price),
            }));

        return res.json({ ok: true, items });
    } catch (e: any) {
        console.error("TECH /jobs error:", e);
        return res.status(500).json({ ok: false, message: "server error", error: String(e?.message || e) });
    }
}

export default withAdminAuth<AdminRequest>(
    handler,
    ["technician", "admin", "manager", "superadmin"]
);
