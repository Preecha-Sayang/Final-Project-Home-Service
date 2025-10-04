import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type {
    PromotionRow,
    PromotionCreatePayload,
    PromotionListOk,
    PromotionErr,
    PromotionOneOk,
} from "@/types/promotion";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PromotionListOk | PromotionOneOk | PromotionErr>
) {

    try {

        if (req.method === "GET") {
            const rows = await sql/*sql*/`
                SELECT promotion_id, code, discount_type, discount_value, usage_limit,
                    expire_at, create_at, update_at
                FROM promotions
                ORDER BY create_at DESC, promotion_id DESC
            ` as PromotionRow[];

            const normalized = rows.map(r => ({
                ...r,
                discount_value: Number(r.discount_value),
            }));

            return res.status(200).json({ ok: true, promotions: normalized });
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
            if (body.expire_at) expireAt = new Date(body.expire_at).toISOString();

            const [row] = await sql/*sql*/`
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
