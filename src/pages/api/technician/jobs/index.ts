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

        type DbRow = {
            booking_id: unknown;
            order_code: unknown;
            status_id: unknown;
            service_date: unknown;
            service_time: unknown;
            address_text: unknown;
            lat: unknown;
            lng: unknown;
            distance_km: unknown;
            service_name: unknown;
            total_price: unknown;
        };

        function toItem(r: unknown): JobListItem & { service_name?: string | null; total_price?: number | null } {
            const o = (typeof r === "object" && r !== null ? r : {}) as DbRow;

            const booking_id = Number((o.booking_id as number | string | null) ?? 0);
            const status_id = Number((o.status_id as number | string | null) ?? 0);

            const order_code = String((o.order_code as string | number | null) ?? "");
            const service_name_raw = o.service_name;
            const service_name =
                typeof service_name_raw === "string" ? service_name_raw :
                    service_name_raw == null ? null : String(service_name_raw);

            const address_text =
                typeof o.address_text === "string" ? o.address_text : String(o.address_text ?? "");

            const latVal = o.lat as number | string | null;
            const lngVal = o.lng as number | string | null;
            const distVal = o.distance_km as number | string | null;
            const priceVal = o.total_price as number | string | null;

            const latNum = latVal == null ? null : Number(latVal);
            const lngNum = lngVal == null ? null : Number(lngVal);
            const distNum = distVal == null ? null : Number(distVal);
            const priceNum = priceVal == null ? null : Number(priceVal);

            const service_date =
                o.service_date == null ? null : String(o.service_date);
            const service_time =
                o.service_time == null ? null : String(o.service_time);

            return {
                booking_id,
                title: String((service_name ?? order_code) || "งาน"),
                address_text,
                lat: Number.isFinite(latNum as number) ? (latNum as number) : null,
                lng: Number.isFinite(lngNum as number) ? (lngNum as number) : null,
                distance_km: Number.isFinite(distNum as number) ? (distNum as number) : null,
                status_id,
                service_date,
                service_time,
                order_code,
                service_name,
                total_price: Number.isFinite(priceNum as number) ? (priceNum as number) : null,
            };
        }

        const items: (JobListItem & { service_name?: string | null; total_price?: number | null })[] =
            (rows as unknown[]).map(toItem);

        return res.json({ ok: true, items });
    } catch (e: unknown) {
        console.error("TECH /jobs error:", e);
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: "server error", error: message });
    }
}

export default withAdminAuth<AdminRequest>(
    handler,
    ["technician", "admin", "manager", "superadmin"]
);
