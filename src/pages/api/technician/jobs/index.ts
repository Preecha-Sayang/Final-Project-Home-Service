import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

type MyReq = NextApiRequest & { admin: AdminJwt };

type JobRow = {
    booking_id: number;
    order_code: string;
    status_id: number;
    admin_id: number | null;
    total_price: string;
    service_date: string;
    service_time: string;
    address_text: string | null;
    distance_km: number | null;
    service_names: string[];
};

async function q<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const { rows } = await query(sql, params as unknown[]);
    return rows as T[];
}

function mapStatus(status?: string): number[] | null {
    switch (status) {
        case "requested": return [1];      // ยังว่าง
        case "pending": return [2, 3];   // รับงานแล้ว/กำลังทำ
        case "done": return [4];      // เสร็จสิ้น
        default: return null;     // ทั้งหมด
    }
}

async function handler(req: MyReq, res: NextApiResponse) {
    const techId = (req.admin as unknown as { adminId: number }).adminId;

    const { status, nearby, lat, lng, me, q: qStr, limit, offset } = req.query;

    const statusList = mapStatus(typeof status === "string" ? status : undefined);
    const onlyMe = me === "1" || me === "true";
    const useNearby = nearby === "1" || nearby === "true";

    const pLimit = Math.max(1, Math.min(Number(limit ?? 20), 100));
    const pOffset = Math.max(0, Number(offset ?? 0));

    const params: unknown[] = [];
    const where: string[] = [];

    if (statusList) {
        params.push(statusList);
        where.push(`b.status_id = ANY($${params.length}::int[])`);
    }

    if (onlyMe) {
        params.push(techId);
        where.push(`b.admin_id = $${params.length}`);
    } else if (statusList?.includes(1)) {
        // หน้า "คำขอบริการซ่อม" ให้เห็นเฉพาะงานว่าง
        where.push(`b.admin_id IS NULL`);
    }

    if (typeof qStr === "string" && qStr.trim()) {
        params.push(`%${qStr.trim()}%`);
        where.push(`
        (
            b.order_code ILIKE $${params.length}
            OR EXISTS (
            SELECT 1
            FROM booking_item bi
            JOIN services s ON s.service_id = bi.service_id
            WHERE bi.booking_id = b.booking_id
                AND s.servicename ILIKE $${params.length}
            )
        )
        `);
    }

    let selectDistance = "NULL::float AS distance_km";
    let orderBy = "b.create_at DESC";

    if (useNearby) {
        const latNum = Number(lat);
        const lngNum = Number(lng);
        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
            return res.status(400).json({ ok: false, message: "lat/lng required for nearby=1" });
        }
        params.push(latNum, lngNum);
        // ของ booking
        selectDistance = `
        6371 * 2 * ASIN(
            SQRT(
            POWER(SIN(RADIANS((( (b.address_data->>'lat')::float - $${params.length - 1}) / 2))), 2) +
            COS(RADIANS($${params.length - 1})) * COS(RADIANS((b.address_data->>'lat')::float)) *
            POWER(SIN(RADIANS((( (b.address_data->>'lng')::float - $${params.length}) / 2))), 2)
            )
        ) AS distance_km
        `;
        orderBy = "distance_km ASC NULLS LAST, b.create_at DESC";
    }

    const sql = `
        SELECT
        b.booking_id,
        b.order_code,
        b.status_id,
        b.admin_id,
        b.total_price::text,
        b.service_date::text,
        b.service_time::text,
        COALESCE((b.address_data->>'address_name'), NULL) AS address_text,
        ${selectDistance},
        ARRAY(
            SELECT s.servicename
            FROM booking_item bi
            JOIN services s ON s.service_id = bi.service_id
            WHERE bi.booking_id = b.booking_id
            ORDER BY bi.booking_item_id
        ) AS service_names
        FROM booking b
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY ${orderBy}
        LIMIT ${pLimit} OFFSET ${pOffset}
    `;

    const rows = await q<JobRow>(sql, params);
    return res.json({ ok: true, items: rows });
}

export default withAdminAuth<MyReq>(handler, ["technician", "admin", "manager", "superadmin"]);
