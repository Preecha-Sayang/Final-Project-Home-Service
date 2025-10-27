import type { NextApiResponse } from "next";
import type { NextApiRequest } from "next";
import { withAdminAuth, type AdminRequest } from "lib/server/withAdminAuth";
import { query } from "lib/db";

type Head = {
    booking_id: number;
    order_code: string;
    status_id: number;
    service_date: string | null;
    service_time: string | null;
    address_data: any;
    pinned_location: { lat: number; lng: number; place_name?: string } | null;
    customer_name: string | null;
    customer_phone: string | null;
    total_price: number | null;
};

type Item = {
    booking_item_id: number;
    servicename: string;
    option_name: string | null;
    quantity: number;
    unit: string | null;
    price: number; // subtotal ของรายการนั้น ๆ
};

type Action = {
    action: string;
    actor_admin_id: number | null;
    created_at: string;
};

function parseId(v: string | string[] | undefined) {
    if (!v || Array.isArray(v)) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

async function handler(req: AdminRequest & NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end();

    const id = parseId(req.query.id);
    if (id == null) return res.status(400).json({ ok: false, message: "bad id" });

    const adminId = Number(req.admin.adminId);

    try {
        // ---- HEAD ----
        const headQ = await query(
            `
      SELECT
        b.booking_id,
        b.order_code,
        b.status_id,
        b.service_date,
        b.service_time,
        b.address_data,
        b.pinned_location,
        COALESCE(b.total_price, 0) AS total_price,
        u.fullname       AS customer_name,
        u.phone_number   AS customer_phone,
        b.admin_id
      FROM booking b
      LEFT JOIN users u ON u.user_id = b.user_id
      WHERE b.booking_id = $1
      LIMIT 1
      `,
            [id]
        );

        const headRow = headQ.rows[0] as (Head & { admin_id: number | null }) | undefined;
        if (!headRow) return res.status(404).json({ ok: false, message: "not found" });

        // ถ้างานถูก assign แล้ว ต้องเป็นของช่างคนนี้เท่านั้น
        if (headRow.admin_id != null && headRow.admin_id !== adminId) {
            return res.status(403).json({ ok: false, message: "forbidden" });
        }

        const head: Head = {
            booking_id: headRow.booking_id,
            order_code: headRow.order_code,
            status_id: headRow.status_id,
            service_date: headRow.service_date,
            service_time: headRow.service_time,
            address_data: headRow.address_data,
            pinned_location: headRow.pinned_location as any,
            customer_name: headRow.customer_name ?? null,
            customer_phone: headRow.customer_phone ?? null,
            total_price: Number(headRow.total_price ?? 0),
        };

        // ---- ITEMS ---- (ให้ตรงสคีมา)
        // booking_item: id, booking_id, service_option_id, quantity, subtotal_price
        // service_option: service_option_id, service_id, name, unit, unit_price
        // services: service_id, servicename, price
        const itemsQ = await query(
            `
      SELECT
        bi.id                              AS booking_item_id,
        s.servicename                      AS servicename,
        so.name                            AS option_name,
        bi.quantity                        AS quantity,
        so.unit                            AS unit,
        bi.subtotal_price                  AS price,
        sc.name                            AS category_name
      FROM booking_item bi
      JOIN service_option so ON so.service_option_id = bi.service_option_id
      JOIN services       s  ON s.service_id        = so.service_id
      JOIN service_categories sc ON sc.category_id = s.category_id
      WHERE bi.booking_id = $1
      ORDER BY bi.id ASC
      `,
            [id]
        );

        const items: Item[] = itemsQ.rows.map((r) => ({
            booking_item_id: Number(r.booking_item_id),
            servicename: r.servicename ?? "-",
            option_name: r.option_name ?? null,
            quantity: Number(r.quantity ?? 0),
            unit: r.unit ?? null,
            price: Number(r.price ?? 0), // ใช้ subtotal_price ตามตาราง
            category_name: r.category_name ?? null,
        }));

        // ---- ACTIONS ----
        const actionsQ = await query(
            `
      SELECT action, actor_admin_id, created_at
      FROM booking_actions
      WHERE booking_id = $1
      ORDER BY id DESC
      LIMIT 50
      `,
            [id]
        );

        const actions: Action[] = actionsQ.rows;

        return res.json({ ok: true, head, items, actions });
    } catch (err) {
        console.error("GET /api/technician/jobs/[id] error:", err);
        return res.status(500).json({ ok: false, message: "server error", error: String(err) });
    }
}

export default withAdminAuth(handler, ["technician", "admin", "manager", "superadmin"]);
