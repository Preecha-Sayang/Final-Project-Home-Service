import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type {
    PromotionRow,
    PromotionUpdatePayload,
    PromotionOneOk,
    PromotionErr,
} from "@/types/promotion";

type DeleteOk = { ok: true; deleted: true };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PromotionOneOk | PromotionErr | DeleteOk>

) {

    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) {
        return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    try {

        if (req.method === "GET") {
            const rows = await sql/*sql*/`
                SELECT promotion_id, code, discount_type, discount_value, usage_limit,
                    expire_at, create_at, update_at
                FROM promotions
                WHERE promotion_id = ${id}
                LIMIT 1
            ` as PromotionRow[];

            const row = rows[0];
            if (!row) return res.status(404).json({ ok: false, message: "Not found" });
            return res.status(200).json({ ok: true, promotion: { ...row, discount_value: Number(row.discount_value) } });
        }

        if (req.method === "PATCH") {
            const body = req.body as PromotionUpdatePayload;

            const code = body.code?.trim();
            if (code !== undefined) {
                if (!code || code.length > 64 || !/^[A-Za-z0-9_-]+$/.test(code)) {
                    return res.status(400).json({ ok: false, message: "Invalid code format." });
                }
            }

            const dtype = body.discount_type;
            if (dtype !== undefined && dtype !== "fixed" && dtype !== "percent") {
                return res.status(400).json({ ok: false, message: "Invalid discount_type." });
            }

            const dval =
                body.discount_value != null ? Number(body.discount_value) : undefined;
            if (dval !== undefined && !Number.isFinite(dval)) {
                return res.status(400).json({ ok: false, message: "Invalid discount_value." });
            }
            if (dtype === "percent" && dval != null && (dval < 0 || dval > 100)) {
                return res.status(400).json({ ok: false, message: "Percent must be 0-100" });
            }
            if (dtype === "fixed" && dval != null && dval < 0) {
                return res.status(400).json({ ok: false, message: "Amount must be >= 0" });
            }

            if (body.usage_limit !== undefined) {
                const ul = body.usage_limit;
                if (ul != null && (!Number.isInteger(ul) || ul < 0)) {
                    return res
                        .status(400)
                        .json({ ok: false, message: "usage_limit must be integer >= 0 or null" });
                }
            }

            const expireAt =
                body.expire_at === null
                    ? null
                    : body.expire_at
                        ? new Date(body.expire_at).toISOString()
                        : undefined;

            if (expireAt !== undefined && expireAt !== null) {
                const t = new Date(expireAt).getTime();
                if (Number.isNaN(t) || t < Date.now())
                    return res
                        .status(400)
                        .json({ ok: false, message: "expire_at must be in the future" });
            }

            const shouldCode = code !== undefined;
            const shouldType = dtype !== undefined;
            const shouldVal = dval !== undefined;
            const shouldLimit = body.usage_limit !== undefined;
            const shouldExpire = expireAt !== undefined;

            //ใช้ CASE WHEN เพื่อ อัปเดตเฉพาะฟิลด์ที่ส่งมา
            if (shouldCode || shouldType || shouldVal || shouldLimit || shouldExpire) {
                await sql`
                    UPDATE promotions
                    SET
                    code           = CASE WHEN ${shouldCode} THEN ${code} ELSE code END,
                    discount_type  = CASE WHEN ${shouldType} THEN ${dtype} ELSE discount_type END,
                    discount_value = CASE WHEN ${shouldVal} THEN ${dval} ELSE discount_value END,
                    usage_limit    = CASE WHEN ${shouldLimit} THEN ${body.usage_limit} ELSE usage_limit END,
                    expire_at      = CASE WHEN ${shouldExpire} THEN ${expireAt} ELSE expire_at END
                    WHERE promotion_id = ${id}
                `;
            }

            const rows = await sql/*sql*/`
                SELECT promotion_id, code, discount_type, discount_value, usage_limit,
                    expire_at, create_at, update_at
                FROM promotions WHERE promotion_id = ${id}
            ` as PromotionRow[];

            const row = rows[0];
            if (!row) return res.status(404).json({ ok: false, message: "Not found" });
            return res.status(200).json({ ok: true, promotion: { ...row, discount_value: Number(row.discount_value) } });
        }

        if (req.method === "DELETE") {
            await sql/*sql*/`DELETE FROM promotions WHERE promotion_id = ${id}`;
            return res.status(200).json({ ok: true, deleted: true });
        }

        return res.status(405).json({ ok: false, message: "Method Not Allowed." });

    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: msg });
    }
}
