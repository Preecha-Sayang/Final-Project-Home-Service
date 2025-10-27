import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";
import type { PromotionUse } from "@/types/promotion";
import Swal from "sweetalert2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //console.log("HELLO API");
  const code = String(req.query.code);
  if (!code) {
    return res.status(400).json({ message: "Invalid promotion code" });
  }

  try {
    if (req.method === "GET") {

//       const check_use = (await sql/*sql*/ `
//         SELECT m.promotion_id, code, discount_type, discount_value, usage_limit,
// count(t.promotion_id) as count_of_use,
// expire_at,
// CASE WHEN expire_at >= Now() THEN TRUE ELSE FALSE END as can_use
// , create_at, update_at
// FROM promotions m
// LEFT JOIN promotion_usage t ON m.promotion_id = t.promotion_id
// WHERE m.code = ${code}
// GROUP BY m.promotion_id, code, discount_type, discount_value, usage_limit, expire_at, create_at, update_at
//     `) as PromotionUse[];

//       const checkuse = check_use[0];

      

      const rows = (await sql/*sql*/ `
                SELECT m.promotion_id, code, discount_type, discount_value, usage_limit,
  count(t.promotion_id) as count_of_use,
  expire_at,
  CASE WHEN expire_at >= Now() THEN TRUE ELSE FALSE END as can_use
  , create_at, update_at
  FROM promotions m
  LEFT JOIN promotion_usage t ON m.promotion_id = t.promotion_id
  WHERE m.code = ${code}
  GROUP BY m.promotion_id, code, discount_type, discount_value, usage_limit, expire_at, create_at, update_at
            `) as PromotionUse[];

      const row = rows[0];
      if (!row) {
        return res
          .status(404)
          .json({ ok: false, message: `ไม่พบโค้ดส่วนลด '${code}'` });
      } else {
        if (!row.can_use) {
          return res.status(200).json({
            ok: false,
            message: `โค้ดส่วนลด '${code}' หมดอายุไม่สามารถใช้งานได้`,
          });
        }
        if (row.count_of_use == row.usage_limit) {
          return res.status(200).json({
            ok: false,
            message: `โค้ดส่วนลด '${code}' ใช้งานครบแล้วไม่สามารถใช้งานได้`,
          });
        }

        return res.status(200).json({
          ok: true,
          message: `สามารถใช้งานโค้ด '${code}' ได้คุณได้รับส่วนลด ${row.discount_value?.toString()} ${
            row.discount_type === "fixed" ? "บาท" : "%"
          }`,
          promotion: { ...row, discount_value: Number(row.discount_value) },
        });
      }
    }

    // if (req.method === "POST") {
    //   const {  bookingId } = req.body;

    //   const rows = (await sql/*sql*/ `
    //   INSERT INTO promotion_usage (promotion_id,booking_id) VALUES (${promotionCode},${bookingId})
    //   RETURNING usage_id,promotion_id,booking_id,used_at
    // `) as promotionUsage[];

    //   const rowUse = rows[0];
    //   if (rowUse) {
    //     return res
    //       .status(200)
    //       .json({ status: true, message: "use promotion code successfully" , promotion: rowUse});
    //   } else {
    //     res.status(500).json({status: false, message: "use promotion code failed"})
    //   }
    // }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ ok: false, message: msg });
  }
}
