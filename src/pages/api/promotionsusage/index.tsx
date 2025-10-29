import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

interface PromotionUsageRequest {
  promotion_id: number;
  booking_id: number;
}

interface PromotionUsageResponse {
  usage_id: number;
  promotion_id: number;
  booking_id: number;
  used_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { promotion_id, booking_id } = req.body as PromotionUsageRequest;

      // Validate input
      if (!promotion_id || !booking_id) {
        return res.status(400).json({
          ok: false,
          message: "promotion_id และ booking_id จำเป็นต้องระบุ",
        });
      }

      // ตรวจสอบว่า promotion_id นี้ถูกใช้กับ booking_id นี้แล้วหรือยัง
      const existingUsage = await sql`
        SELECT usage_id 
        FROM promotion_usage 
        WHERE promotion_id = ${promotion_id} AND booking_id = ${booking_id}
      `;

      if (existingUsage.length > 0) {
        return res.status(400).json({
          ok: false,
          message: "โค้ดส่วนลดนี้ถูกใช้กับการจองนี้แล้ว",
        });
      }

      // บันทึกการใช้ promotion
      const rows = await sql`
        INSERT INTO promotion_usage (promotion_id, booking_id)
        VALUES (${promotion_id}, ${booking_id})
        RETURNING usage_id, promotion_id, booking_id, used_at
      ` as PromotionUsageResponse[];

      const usage = rows[0];

      return res.status(201).json({
        ok: true,
        message: "บันทึกการใช้โค้ดส่วนลดสำเร็จ",
        usage,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[POST /api/promotionsusage] Error:", msg);
      return res.status(500).json({
        ok: false,
        message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        error: msg,
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    ok: false,
    message: "Method Not Allowed. Use POST to create promotion usage.",
  });
}