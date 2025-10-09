import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type {
    PromotionRow,
    PromotionCreatePayload,
    PromotionListOk,
    PromotionErr,
    PromotionOneOk,
} from "@/types/promotion";

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 100;

const SORTABLE = {
    code: sql`code`,
    discount_type: sql`discount_type`,
    discount_value: sql`discount_value`,
    expire_at: sql`expire_at`,
    create_at: sql`create_at`,
    update_at: sql`update_at`,
} as const;
type SortKey = keyof typeof SORTABLE;

function parseIntSafe(v: unknown, d = 1) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
}
function parseSort(v: unknown): SortKey {
    const k = String(v ?? "");
    return (k in SORTABLE ? (k as SortKey) : "create_at");
}
function parseOrder(v: unknown): "ASC" | "DESC" {
    const s = String(v ?? "DESC").toUpperCase();
    return s === "ASC" ? "ASC" : "DESC";
}

type ListOkLocal = { ok: true; items: PromotionRow[]; total: number };
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ListOkLocal | PromotionOneOk | PromotionErr>
) {
    try {
        if (req.method === "GET") {
            const pageSize = Math.min(
                PAGE_SIZE_MAX,
                parseIntSafe(req.query.pageSize, PAGE_SIZE_DEFAULT)
            );
            const page = Math.max(1, parseIntSafe(req.query.page, 1));
            const offset = (page - 1) * pageSize;

            const q = String(req.query.q ?? "").trim();

            // where fragment
            const where =
                q.length > 0 ? sql`WHERE code ILIKE ${"%" + q + "%"}` : sql``;

            // sort fragment (ใช้ whitelist)
            const sortBy: SortKey = parseSort(req.query.sortBy);
            const order = parseOrder(req.query.order);
            const sortFrag = SORTABLE[sortBy];
            const orderFrag = order === "ASC" ? sql`ASC` : sql`DESC`;

            // รายการ
            const rows = await sql`
                SELECT promotion_id, code, discount_type, discount_value, usage_limit,
                    expire_at, create_at, update_at
                FROM promotions
                ${where}
                ORDER BY ${sortFrag} ${orderFrag}
                LIMIT ${pageSize} OFFSET ${offset}
            ` as PromotionRow[];

            // นับทั้งหมด
            const [{ count }] = await sql`
                SELECT COUNT(*)::int AS count
                FROM promotions
                ${where}
            ` as { count: number }[];

            const normalized = rows.map((r) => ({
                ...r,
                discount_value: Number(r.discount_value),
            }));

            return res.status(200).json({
                ok: true,
                items: normalized,
                total: count,
            });
        }

        if (req.method === "POST") {
            const body = req.body as PromotionCreatePayload;
            const code = (body.code || "").trim();
            const dtype = body.discount_type;
            const dval = Number(body.discount_value);

            if (!code || (dtype !== "fixed" && dtype !== "percent") || Number.isNaN(dval)) {
                return res.status(400).json({ ok: false, message: "Invalid payload." });
            }
            if (dtype === "percent" && (dval < 0 || dval > 100)) {
                return res.status(400).json({ ok: false, message: "Percent must be 0-100" });
            }
            if (dtype === "fixed" && dval < 0) {
                return res.status(400).json({ ok: false, message: "Amount must be >= 0" });
            }

            let expireAt: string | null = null;
            if (body.expire_at) {
                const t = new Date(body.expire_at);
                if (Number.isNaN(+t)) return res.status(400).json({ ok: false, message: "Invalid expire_at" });
                if (t.getTime() <= Date.now()) {
                    return res.status(400).json({ ok: false, message: "expire_at must be in the future." });
                }
                expireAt = t.toISOString();
            }

            const [row] = await sql`
                INSERT INTO promotions (code, discount_type, discount_value, usage_limit, expire_at)
                VALUES (${code}, ${dtype}, ${dval}, ${body.usage_limit ?? null}, ${expireAt})
                RETURNING promotion_id, code, discount_type, discount_value, usage_limit,
                        expire_at, create_at, update_at
            ` as PromotionRow[];

            const normalized = { ...row, discount_value: Number(row.discount_value) };
            return res.status(200).json({ ok: true, promotion: normalized });
        }

        return res.status(405).json({ ok: false, message: "Method Not Allowed." });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: msg });
    }
}
