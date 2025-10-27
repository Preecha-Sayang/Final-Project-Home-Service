// src/pages/api/bookings/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  if (req.method === "GET") {
    try {
      // ดึงข้อมูลการจอง พร้อมข้อมูล promotion
      const bookingResult = await query(
        `SELECT
          b.booking_id,
          b.user_id,
          b.discount,
          b.promotion_id,
          b.total_price,
          b.service_date,
          b.service_time,
          b.create_at,
          b.update_at,
          b.status_id,
          b.order_code,
          b.admin_id,
          b.address_data,
          p.code as promo_code,
          p.discount_type,
          p.discount_value
        FROM booking b
        LEFT JOIN promotions p ON b.promotion_id = p.promotion_id
        WHERE b.booking_id = $1`,
        [id]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const booking = bookingResult.rows[0];
      console.log("Booking data from database:", booking);

      // ดึงรายการบริการ
      const itemsResult = await query(
        `SELECT
          bi.id,
          bi.booking_id,
          bi.service_option_id,
          bi.quantity,
          bi.subtotal_price,
          so.name as title,
          so.unit_price as price,
          so.unit
        FROM booking_item bi
        LEFT JOIN service_option so ON bi.service_option_id = so.service_option_id
        WHERE bi.booking_id = $1`,
        [id]
      );

      console.log("Items data from database:", itemsResult.rows);

      // แปลงข้อมูลให้ตรงกับ frontend
      const formattedBooking = {
        booking_id: booking.booking_id,
        service_name: "บริการล้างแอร์", // อาจต้องดึงจาก service_option หรือตารางอื่น
        items: itemsResult.rows.map((item) => ({
          title: item.title || "บริการ",
          price: parseFloat(item.price) || 0,
          quantity: item.quantity,
          unit: item.unit || "รายการ",
        })),
        total_amount: parseFloat(booking.total_price),
        discount_amount: parseFloat(booking.discount || 0),
        final_amount:
          parseFloat(booking.total_price) - parseFloat(booking.discount || 0),
        promo_code: booking.promo_code || null,
        discount_type: booking.discount_type || null,
        discount_value: booking.discount_value ? parseFloat(booking.discount_value) : null,
        service_date: booking.service_date,
        service_time: booking.service_time,
        address: booking.address_data?.address || "",
        province: booking.address_data?.province || "",
        district: booking.address_data?.district || "",
        subdistrict: booking.address_data?.subdistrict || "",
        additional_info: booking.address_data?.additional_info || null,
        status: booking.status_id === 1 ? "confirmed" : "pending",
        charge_id: null, // อาจต้องเก็บในตารางแยก
      };

      console.log("Formatted booking data:", formattedBooking);

      return res.status(200).json({
        success: true,
        booking: formattedBooking,
      });
    } catch (error) {
      console.error("Get booking error:", error);
      return res.status(500).json({
        error: "Failed to get booking",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { status, charge_id } = req.body;
      const updates: string[] = [];
      const values: (string | number | null)[] = [];
      let paramCount = 1;

      if (status) {
        updates.push(`status = $${paramCount}`);
        values.push(status);
        paramCount++;
      }

      if (charge_id) {
        updates.push(`charge_id = $${paramCount}`);
        values.push(charge_id);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      updates.push(`update_at = NOW()`);
      values.push(id);

      const result = await query(
        `UPDATE booking
        SET ${updates.join(", ")}
        WHERE booking_id = $${paramCount}
        RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      return res.status(200).json({
        success: true,
        booking: result.rows[0],
      });
    } catch (error) {
      console.error("Update booking error:", error);
      return res.status(500).json({
        error: "Failed to update booking",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}